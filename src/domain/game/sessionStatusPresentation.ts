import { Status } from '@/src/types/status'

export const sessionStatusTranslationKey = (status: Status): string => {
  switch (status) {
    case Status.NotStarted:
      return 'GameController.sessionStatus.notStarted'
    case Status.Started:
      return 'GameController.sessionStatus.started'
    case Status.InProgress:
      return 'GameController.sessionStatus.inProgress'
    case Status.Finished:
      return 'GameController.sessionStatus.finished'
    default:
      return 'GameController.sessionStatus.notStarted'
  }
}

export const sessionStatusEmoji = (status: Status): string => {
  switch (status) {
    case Status.InProgress:
      return '⏱️'
    case Status.Finished:
      return '🎉'
    default:
      return '🚀'
  }
}
