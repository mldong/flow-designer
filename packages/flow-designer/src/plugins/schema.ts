import type { FDFormType } from "../types";
import { ReapplyModeEnum } from "../types/enums";
import {
  castAddSignMaxRounds,
  collabModeWrites,
  omitAddSignMaxRounds,
  omitAllowRecall,
  showAddSignRounds,
  showCollabGroup,
  validateAddSignMaxRounds,
  validateCollabMode,
} from "./task-properties";

/**
 * 表单元数据。label / helpMessage / options[].label 写 `fd.` 词条 key，由 FDSchemaForm
 * 渲染时解引用；name / value / defaultValue 属流程定义数据，一律保持原值不参与翻译。
 * placeholder 仅在与「请输入/请选择 + 标签」不同构时显式给 key，否则由渲染器派生。
 */
export const start:FDFormType = {
  labelWidth: 'fd.labelWidth.narrow',
  formItems: [{
    name: "name",
    label: "fd.field.code",
    component: 'Input'
  },{
    name: "preInterceptors",
    label: "fd.field.preInterceptors",
    component: 'Input'
  }, {
    name: "postInterceptors",
    label: "fd.field.postInterceptors",
    component: 'Input'
  }]
}

/**
 * 结束节点表单元数据
 * 
 */
export const end:FDFormType = {
  labelWidth: 'fd.labelWidth.narrow',
  formItems: [{
    name: "name",
    label: "fd.field.code",
    component: 'Input'
  }, {
    name: "preInterceptors",
    label: "fd.field.preInterceptors",
    component: 'Input'
  }, {
    name: "postInterceptors",
    label: "fd.field.postInterceptors",
    component: 'Input'
  }]
}

/**
 * 用户任务表单元数据
 * 
 */

export const task:FDFormType = {
  labelWidth: 'fd.labelWidth.task',
  formItems: [{
    name: "name",
    label: "fd.field.code",
    component: 'Input'
  }, {
    name: "displayName",
    label: "fd.field.displayName",
    component: 'Input'
  }, {
    name: "preInterceptors",
    label: "fd.field.preInterceptors",
    component: 'Input'
  }, {
    name: "postInterceptors",
    label: "fd.field.postInterceptors",
    component: 'Input'
  }, {
    name: "form",
    label: "fd.field.form",
    component: 'Input'
  }, 
  {
    name: "assignee",
    label: "fd.field.assignee",
    component: 'Input'
  }, {
    name: "assignmentHandler",
    label: "fd.field.assignmentHandler",
    component: 'Input'
  }, {
    name: "candidateUsers",
    label: "fd.field.candidateUsers",
    component: 'Input',
    helpMessage: 'fd.help.candidateUsers',
    componentProps: {
      placeholder: 'fd.field.candidateUsers.ph'
    }
  }, {
    name: "candidateGroups",
    label: "fd.field.candidateGroups",
    component: 'Input',
    helpMessage: 'fd.help.candidateGroups',
    componentProps: {
      placeholder: 'fd.field.candidateGroups.ph'
    }
  }, {
    name: "candidateHandler",
    label: "fd.field.candidateHandler",
    component: 'Input'
  }, {
    name: "taskType",
    label: "fd.field.taskType",
    component: 'Select',
    componentProps: {
      options: [
        {
          label: 'fd.opt.major',
          value: 'Major'
        },
        {
          label: 'fd.opt.aidant',
          value: 'Aidant'
        }
      ]
    }
  }, {
    name: "performType",
    label: "fd.field.performType",
    component: 'Select',
    componentProps: {
      options: [
        {
          label: 'fd.opt.performAny',
          value: 'ANY'
        },
        {
          label: 'fd.opt.performAll',
          value: 'ALL'
        }
      ]
    }
  }, {
    name: "countersignType",
    label: "fd.field.countersignType",
    component: 'Select',
    defaultValue: 'PARALLEL',
    helpMessage: 'fd.help.countersignType',
    componentProps: {
      options: [
        {
          label: 'fd.opt.csParallel',
          value: 'PARALLEL'
        },
        {
          label: 'fd.opt.csSequential',
          value: 'SEQUENTIAL'
        }
      ]
    }
  }, {
    name: "countersignCompletionCondition",
    label: "fd.field.countersignCompletionCondition",
    component: 'Input',
    helpMessage: 'fd.help.countersignCompletionCondition'
  }, {
    name: "reapplyMode",
    label: "fd.field.reapplyMode",
    component: 'Select',
    defaultValue: ReapplyModeEnum.normal,
    helpMessage: 'fd.help.reapplyMode',
    componentProps: {
      options: [
        {
          label: 'fd.opt.reapplyNormal',
          value: ReapplyModeEnum.normal
        },
        {
          label: 'fd.opt.reapplyReturnToSource',
          value: ReapplyModeEnum.returnToSource
        }
      ]
    }
  }, {
    name: "collabMode",
    label: "fd.field.collabMode",
    component: 'Select',
    defaultValue: 'none',
    helpMessage: 'fd.help.collabMode',
    show: showCollabGroup,
    multiWrite: collabModeWrites,
    validate: validateCollabMode,
    componentProps: {
      options: [
        {
          label: 'fd.opt.collabNone',
          value: 'none'
        },
        {
          label: 'fd.opt.collabAfterSign',
          value: 'afterSign'
        },
        {
          label: 'fd.opt.collabDynamic',
          value: 'dynamicCountersign'
        }
      ]
    }
  }, {
    name: "addSignMaxRounds",
    label: "fd.field.addSignMaxRounds",
    component: 'Input',
    defaultValue: 0,
    helpMessage: 'fd.help.addSignMaxRounds',
    show: showAddSignRounds,
    omit: omitAddSignMaxRounds,
    validate: validateAddSignMaxRounds,
    cast: castAddSignMaxRounds,
    componentProps: {
      placeholder: 'fd.field.addSignMaxRounds.ph'
    }
  }, {
    name: "allowRecall",
    label: "fd.field.allowRecall",
    component: 'Select',
    defaultValue: false,
    helpMessage: 'fd.help.allowRecall',
    show: showCollabGroup,
    omit: omitAllowRecall,
    componentProps: {
      options: [
        {
          label: 'fd.opt.no',
          value: false
        },
        {
          label: 'fd.opt.yes',
          value: true
        }
      ]
    }
  }, {
    name: "actionBtns",
    label: "fd.field.actionBtns",
    component: 'Input',
    helpMessage: [
      'fd.help.actionBtns.1',
      'fd.help.actionBtns.2'
    ],
    componentProps: {
      placeholder: 'fd.field.actionBtns.ph'
    }
  }, {
    name: "reminderTime",
    label: "fd.field.reminderTime",
    component: 'Input'
  }, {
    name: "reminderRepeat",
    label: "fd.field.reminderRepeat",
    component: 'Input'
  }, {
    name: "expireTime",
    label: "fd.field.expireTime",
    component: 'Input'
  }, {
    name: "autoExecute",
    label: "fd.field.autoExecute",
    component: 'Select',
    componentProps: {
      options: [
        {
          label: 'fd.opt.yes',
          value: 'Y'
        },
        {
          label: 'fd.opt.no',
          value: 'N'
        }
      ]
    }
  }, {
    name: "callback",
    label: "fd.field.callback",
    component: 'Input'
  }]
}
/**
 * 
"expireTime":
"1",
"instanceUrl":
"leaveForm",
"instanceNoClass":
"2",
"preInterceptors":
"3",
"postInterceptors":
"4",
 */
export const process: FDFormType = {
  labelWidth: 'fd.labelWidth.wide',
  formItems: [{
    name: "name",
    label: "fd.field.processCode",
    component: 'Input'
  }, {
    name: "displayName",
    label: "fd.field.processDisplayName",
    component: 'Input'
  },{
    name: "expireTime",
    label: "fd.field.expireTimeExpected",
    component: 'Input'
  },{
    name: "instanceUrl",
    label: "fd.field.instanceUrl",
    component: 'Input',
    helpMessage: 'fd.help.instanceUrl'
  },{
    name: "enableFieldPerm",
    label: "fd.field.enableFieldPerm",
    component: 'Select',
    defaultValue: 0,
    helpMessage: 'fd.help.enableFieldPerm',
    componentProps: {
      placeholder: 'fd.field.enableFieldPerm.ph',
      options: [
        {
          label: 'fd.opt.no',
          value: 0
        },
        {
          label: 'fd.opt.yes',
          value: 1
        }
      ]
    }
  },{
    name: "instanceNoClass",
    label: "fd.field.instanceNoClass",
    component: 'Input'
  },{
    name: "preInterceptors",
    label: "fd.field.preInterceptors",
    component: 'Input'
  }, {
    name: "postInterceptors",
    label: "fd.field.postInterceptors",
    component: 'Input'
  }, {
    name: "relTableName",
    label: "fd.field.relTableName",
    component: 'Input',
    helpMessage: 'fd.help.relTableName',
    componentProps: {
      placeholder: 'fd.field.relTableName.ph'
    }
  }, {
    name: "persistMode",
    label: "fd.field.persistMode",
    component: 'Select',
    defaultValue: 'ARCHIVE',
    helpMessage: 'fd.help.persistMode',
    componentProps: {
      options: [
        {
          label: 'fd.opt.persistArchive',
          value: 'ARCHIVE'
        },
        {
          label: 'fd.opt.persistSync',
          value: 'SYNC'
        }
      ]
    }
  }, {
    name: "selectUserOnInitiate",
    label: "fd.field.selectUserOnInitiate",
    component: 'Select',
    defaultValue: 0,
    componentProps: {
      options: [
        {
          label: 'fd.opt.no',
          value: 0
        },
        {
          label: 'fd.opt.yes',
          value: 1
        }
      ]
    }
  }, {
    name: "selectUserApi",
    label: "fd.field.selectUserApi",
    component: 'Input',
    helpMessage: 'fd.help.selectUserApi'
  }, {
    name: "enableCcActors",
    label: "fd.field.enableCcActors",
    component: 'Select',
    defaultValue: 0,
    componentProps: {
      placeholder: 'fd.field.enableCcActors.ph',
      options: [
        {
          label: 'fd.opt.no',
          value: 0
        },
        {
          label: 'fd.opt.yes',
          value: 1
        }
      ]
    }
  }, {
    name: "enableApplyReason",
    label: "fd.field.enableApplyReason",
    component: 'Select',
    defaultValue: 0,
    componentProps: {
      placeholder: 'fd.field.enableApplyReason.ph',
      options: [
        {
          label: 'fd.opt.no',
          value: 0
        },
        {
          label: 'fd.opt.yes',
          value: 1
        }
      ]
    }
  }, {
    name: "enableAttachment",
    label: "fd.field.enableAttachment",
    component: 'Select',
    defaultValue: 0,
    componentProps: {
      placeholder: 'fd.field.enableAttachment.ph',
      options: [
        {
          label: 'fd.opt.no',
          value: 0
        },
        {
          label: 'fd.opt.yes',
          value: 1
        }
      ]
    }
  }]
}
export const subProcess: FDFormType = {
  labelWidth: 'fd.labelWidth.wide',
  formItems: [{
    name: "name",
    label: "fd.field.processCode",
    component: 'Input'
  }, {
    name: "displayName",
    label: "fd.field.processDisplayName",
    component: 'Input'
  },{
    name: "form",
    label: "fd.field.form",
    component: 'Input'
  },{
    name: "version",
    label: "fd.field.version",
    component: 'Input'
  },]
}
export const decision: FDFormType = {
  labelWidth: 'fd.labelWidth.narrow',
  formItems: [{
    name: "name",
    label: "fd.field.code",
    component: 'Input'
  }, {
    name: "expr",
    label: "fd.field.expr",
    component: 'Input'
  },{
    name: "handleClass",
    label: "fd.field.handleClass",
    component: 'Input'
  },  {
    name: "clazz",
    label: "fd.field.clazz",
    component: 'Input'
  },{
    name: "methodName",
    label: "fd.field.methodName",
    component: 'Input'
  },{
    name: "args",
    label: "fd.field.args",
    component: 'Input'
  },{
    name: "preInterceptors",
    label: "fd.field.preInterceptors",
    component: 'Input'
  }, {
    name: "postInterceptors",
    label: "fd.field.postInterceptors",
    component: 'Input'
  }]
}
export const fork: FDFormType = {
  labelWidth: 'fd.labelWidth.narrow',
  formItems: [{
    name: "name",
    label: "fd.field.code",
    component: 'Input'
  }]
}
export const join: FDFormType = {
  labelWidth: 'fd.labelWidth.narrow',
  formItems: [{
    name: "name",
    label: "fd.field.code",
    component: 'Input'
  }]
}
export const custom: FDFormType = {
  labelWidth: 'fd.labelWidth.narrow',
  formItems: [{
    name: "name",
    label: "fd.field.code",
    component: 'Input'
  }, {
    name: "displayName",
    label: "fd.field.displayName",
    component: 'Input'
  }, {
    name: "clazz",
    label: "fd.field.clazz",
    component: 'Input'
  },{
    name: "methodName",
    label: "fd.field.methodName",
    component: 'Input'
  },{
    name: "args",
    label: "fd.field.args",
    component: 'Input'
  },{
    name: "preInterceptors",
    label: "fd.field.preInterceptors",
    component: 'Input'
  }, {
    name: "postInterceptors",
    label: "fd.field.postInterceptors",
    component: 'Input'
  }]
}

export const edge: FDFormType = {
  labelWidth: 'fd.labelWidth.narrow',
  formItems: [{
    name: "name",
    label: "fd.field.code",
    component: 'Input'
  }, {
    name: "displayName",
    label: "fd.field.displayName",
    component: 'Input'
    },
    {
      name: "expr",
      label: "fd.field.expression",
      component: 'Input'
    },
  ]
}
