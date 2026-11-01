<template>
  <FDForm v-if="items.length" :label-width="resolvedLabelWidth">
    <FDFormItem
      v-for="item in items"
      :key="item.name"
      :label="item.help.length ? undefined : item.label"
    >
      <template v-if="item.help.length" #label>
        {{ item.label }}
        <FDTooltip>
          <template #content>
            <template v-if="item.help.length > 1">
              <div v-for="(msg, i) in item.help" :key="i">{{ msg }}</div>
            </template>
            <template v-else>{{ item.help[0] }}</template>
          </template>
          <img :src="QuestionSvg" />
        </FDTooltip>
      </template>
      <FDInput v-if="item.component == 'Input'" v-model="model[item.name]" v-bind="item.componentProps"></FDInput>
      <FDSelect v-else-if="item.component == 'Select'" v-model="model[item.name]" v-bind="item.componentProps"></FDSelect>
      <template v-else-if="item.slot">
        <slot :name="item.slot" v-bind="renderContext"></slot>
      </template>
      <component v-else :is="item.render ? item.render(renderContext) : undefined" v-model="model[item.name]" v-model:value="model[item.name]" v-model:checked="model[item.name]" />
    </FDFormItem>
  </FDForm>
</template>

<script setup lang="ts">
/**
 * FDSchemaForm —— FDFormType 元数据 → 表单的共享渲染器
 * canvas 抽屉 / dingtalk 编辑抽屉 / dingtalk 流程弹窗三处共用，
 * 保证双模式内置表单外观与能力（Input/Select/slot/render/helpMessage）完全一致。
 * model 为外部 reactive 对象，直接按 item.name 读写（设计器场景无校验需求）。
 *
 * 文案解引用集中在此处：元数据里的 label / helpMessage / options[].label / placeholder
 * 允许写 `fd.` 词条 key（随语种响应式变化），非 `fd.` 前缀的串（集成方自定义文案）原样输出。
 */
import { computed } from 'vue'
import FDForm from './FDForm.vue'
import FDFormItem from './FDFormItem.vue'
import FDInput from './FDInput.vue'
import FDSelect from './FDSelect.vue'
import FDTooltip from './FDTooltip.vue'
import QuestionSvg from '../../assets/question.svg'
import type { FDFormItemType } from '../../types'
import { FD_KEY_PREFIX, resolveText, t } from '../../locales'

const props = withDefaults(defineProps<{
  formItems?: FDFormItemType[]
  model: Record<string, any>
  labelWidth?: string
  renderContext?: any
}>(), {
  labelWidth: 'fd.labelWidth.narrow'
})

const resolvedLabelWidth = computed(() => resolveText(props.labelWidth))

function helpOf(item: FDFormItemType): string[] {
  const help = item.helpMessage
  if (Array.isArray(help)) return help.map(msg => resolveText(msg))
  return help ? [resolveText(help)] : []
}

/** 未显式配置的占位符按「请输入/请选择 + 标签」派生，省掉一份重复词条 */
function placeholderOf(item: FDFormItemType, label: string): string | undefined {
  const declared = item.componentProps?.placeholder
  if (declared) return resolveText(declared)
  if (!label || label.startsWith(FD_KEY_PREFIX)) return undefined
  return t(item.component === 'Select' ? 'fd.ph.select' : 'fd.ph.input', { label })
}

const items = computed(() =>
  (props.formItems || [])
    // 条件显隐（item.show）在这里统一生效：三处共用本渲染器的表单都不必各写一遍隐藏规则
    .filter((item) => !item.show || item.show(props.model))
    .map((item) => {
      const label = resolveText(item.label) ?? ''
      const options = item.componentProps?.options
      return {
        ...item,
        label,
        help: helpOf(item),
        componentProps: {
          ...item.componentProps,
          placeholder: placeholderOf(item, label),
          options: Array.isArray(options)
            ? options.map((opt: any) => ({ ...opt, label: resolveText(opt.label) }))
            : options,
        },
      }
    })
)
</script>
