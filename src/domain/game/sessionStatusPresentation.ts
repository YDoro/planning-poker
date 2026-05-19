export type DomainStatus = 'NotStarted' | 'Started' | 'InProgress' | 'Finished';

export const sessionStatusTranslationKey = (status: DomainStatus): string => {
  switch (status) {
    case 'NotStarted':
      return 'GameController.sessionStatus.notStarted'
    case 'Started':
      return 'GameController.sessionStatus.started'
    case 'InProgress':
      return 'GameController.sessionStatus.inProgress'
    case 'Finished':
      return 'GameController.sessionStatus.finished'
    default:
      return 'GameController.sessionStatus.notStarted'
  }
}

export const sessionStatusEmoji = (status: DomainStatus): string => {
  switch (status) {
    case 'InProgress':
      return '⏱️'
    case 'Finished':
      return '🎉'
    default:
      return '🚀'
  }
}
