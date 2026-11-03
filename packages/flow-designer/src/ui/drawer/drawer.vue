<template>
  <FDDrawer :visible="visible" :title="mTitle" :width="widthStr" :show-footer="false" @cancel="visible=false">
    <FDSchemaForm
      :form-items="form.formItems"
      :model="formState"
      :label-width="form.labelWidth || fdLabelWidth('narrow')"
      :render-context="currentData"
    >
      <!-- 业务方 slot 透传（item.slot 场景） -->
      <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
        <slot :name="name" v-bind="scope" />
      </template>
    </FDSchemaForm>
  </FDDrawer>
</template>
<script setup lang="ts">
import { computed, PropType, reactive, ref, watch } from 'vue';
import { FDDrawer, FDSchemaForm, FDMessage } from '../fd';
import { FDFormType, FDFormItemType } from '../../types';
import { fdLabelWidth, resolveText, t } from '../../locales'
import { decidePropertyWrite, deriveCollabMode, isApplyNode, isCountersignNode, normalizeReapplyMode, isInvalidReapplyMode } from '../../plugins/task-properties'

const visible = ref(false)
const props = defineProps({
  title: { // 标题
    type: String as PropType<string>
  },
  width: { // 抽屉宽度
    type: [String,Number] as PropType<string | number>,
    default: '600px'
  }
})
const mTitle = ref(props.title)
const formState = reactive<any>({})
watch(()=>props.title,()=>{
  mTitle.value = props.title
})
// FDDrawer width 只接受字符串，数字宽度补 px
const widthStr = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})
const form = ref<FDFormType>({} as any)
const currentData = ref()
let watchMap: any = {}
// 业务属性写回：按表单项声明决定写值 / 删键 / 保持原值，与钉钉模式共用同一判据
function writeProperty(lf: any, item: FDFormItemType, value: any) {
  const decision = decidePropertyWrite(item, value, formState)
  if (decision.kind === 'skip') {
    // 非法值只提示，不写回，也不覆盖定义里已有的值
    if (decision.error) FDMessage.error(t(decision.error))
    return
  }
  if (decision.kind === 'remove') {
    lf.deleteProperty(formState.name, item.name)
    return
  }
  if (decision.kind === 'writes') {
    decision.writes.forEach(w => {
      if (w.remove) lf.deleteProperty(formState.name, w.key)
      else lf.setProperties(formState.name, { [w.key]: w.value })
    })
    return
  }
  lf.setProperties(formState.name, {
    [item.name]: decision.value,
  })
}
// 本次改动让别的条件项隐藏或回到缺省时，那些键一起消失，否则定义里留下看不见也改不动的配置
function sweepHiddenProperties(lf: any, item: FDFormItemType) {
  form.value?.formItems?.forEach(sibling => {
    if (sibling.name === item.name || !sibling.show) return
    if (decidePropertyWrite(sibling, formState[sibling.name], formState).kind !== 'remove') return
    if (sibling.multiWrite) {
      // 多键项（办理协同）隐藏＝两枚引擎键一起清，删虚键本身没有意义
      sibling.multiWrite('none', formState).forEach(w => {
        if (w.remove) lf.deleteProperty(formState.name, w.key)
      })
      return
    }
    lf.deleteProperty(formState.name, sibling.name)
  })
}
defineExpose({
  show(e: any){
    currentData.value = e;
    Object.keys(formState).forEach(key=>{
      formState[key] = undefined
    })
    
    form.value = e.patternItem?.form || {}
    const lf = currentData.value.lf
    const typePrefix = lf.graphModel.props.typePrefix || ''
    // 监听唯一编码变化=>修改节点id
    form.value?.formItems?.forEach(item=>{
      let stopWatch = watchMap[item.name]
      if(stopWatch) {
        stopWatch()
      }
      stopWatch = watch(()=>formState[item.name],(n, o)=>{
        if(e.data.type == 'process') {
          lf.graphModel[item.name] = n
          const { eventCenter } = lf.graphModel;
          // 触发自定义的update:graphModel
          eventCenter.emit("update:graphModel", lf.graphModel);
        } else if(e.data.type == `${typePrefix}transition`) {
          if(item.name == 'name') {
          // 如果为唯一编码，则修改节点id
            lf.changeEdgeId(o, n);
          } else if(item.name == 'displayName') {
            // 如果为显示名称，则修改节点显示名称
            lf.updateText(formState.name, n);
          } else {
            // 务属性变化=>修改节点属性
            writeProperty(lf, item, n);
            sweepHiddenProperties(lf, item);
          }
        } else {
          if(item.name == 'name') {
          // 如果为唯一编码，则修改节点id
            const lf = currentData.value.lf
            lf.changeNodeId(o, n);
          } else if(item.name == 'displayName') {
            // 如果为显示名称，则修改节点显示名称
            const lf = currentData.value.lf
            lf.updateText(formState.name, n);
          } else {
            // 务属性变化=>修改节点属性
            const lf = currentData.value.lf
            writeProperty(lf, item, n);
            sweepHiddenProperties(lf, item);
          }
        }
      }, {
        deep: true
      })
      watchMap[item.name] = stopWatch
      // 先根据默认值赋值
      if(item.defaultValue!==undefined) {
        formState[item.name] = item.defaultValue
      }
    })
    
    if(e.data.type == 'process') {
      mTitle.value = t('fd.drawer.title.process')
      Object.keys(e.data.properties || {}).forEach(key=>{
        formState[key] = e.data.properties[key]
      })
    } else if(e.data.type == `${typePrefix}transition`) {
      mTitle.value = t('fd.drawer.title.edge')
      // 赋值唯一编码
      formState.name = e.data.id
      // 赋值显示名称
      formState.displayName = e.data.text?.value
      // 赋值业务属性
      Object.keys(e.data.properties || {}).forEach(key=>{
        formState[key] = e.data.properties[key]
      })
    } else {
      if(e.patternItem?.drawerTitle) {
        mTitle.value = e.patternItem?.drawerTitle
      } else if(e.patternItem?.text) {
        // 原文案靠 text.replace('节点','') 去掉后缀再补回，跨语种不成立，改为整体带参
        mTitle.value = t('fd.drawer.title.node', { name: resolveText(e.patternItem.label) || e.patternItem.text })
      } else {
        mTitle.value = t('fd.drawer.title.attr')
      }
      // 赋值唯一编码
      formState.name = e.data.id
      // 赋值显示名称
      formState.displayName = e.data.text?.value
      // 赋值业务属性
      Object.keys(e.data.properties || {}).forEach(key=>{
        formState[key] = e.data.properties[key]
      })
      // reapplyMode 缺省/空值后端一律按 NORMAL 处理，回填时同口径归一，避免把历史空串写回
      if (form.value?.formItems?.some(item=>item.name === 'reapplyMode')) {
        if (isInvalidReapplyMode(formState.reapplyMode)) {
          // 非法配置保留原值并提示，绝不归一成 NORMAL 写回流程定义
          FDMessage.error(`节点属性 reapplyMode 值无效：${formState.reapplyMode}，请改为 NORMAL 或 RETURN_TO_SOURCE`)
        } else {
          formState.reapplyMode = normalizeReapplyMode(formState.reapplyMode)
        }
      }
      // 办理协同三档回显派生（issues/246/247）：两键同 true＝互斥脏态，红错拦写；
      // 会签节点与申请节点整组隐藏（伪键 __collabHidden 只进表单模型，永不写回定义）
      if (form.value?.formItems?.some(item => item.name === 'collabMode')) {
        formState.collabMode = deriveCollabMode(formState)
        if (formState.collabMode === '') {
          FDMessage.error(t('fd.err.collabMutex'))
        }
        formState.__collabHidden = isCountersignNode(formState)
          || isApplyNode(e.data.id, lf.graphModel, typePrefix)
      }
    }
    visible.value = true
  }
})
</script>
<style lang="less" scoped>

</style>