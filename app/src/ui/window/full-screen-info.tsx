import * as React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { remote } from 'electron'
import { WindowState, getWindowState } from '../../lib/window-state'

interface IFullScreenInfoState {
  readonly renderInfo: boolean
  readonly renderTransitionGroup: boolean
  readonly lastWindowState: WindowState
}

const transitionDuration = 100
const holdDuration = 750

export class FullScreenInfo extends React.Component<any, IFullScreenInfoState> {

  private infoDisappearTimeoutId: number | null = null
  private transitionGroupDisappearTimeoutId: number | null = null

  public constructor() {
    super()

    this.state = {
      lastWindowState: getWindowState(remote.getCurrentWindow()),
      renderInfo: false,
      renderTransitionGroup: false,
    }
  }

  private showFullScreenNotification() {
    const hasChangedWindowState = this.state.lastWindowState !== getWindowState(remote.getCurrentWindow())

    this.setState({
      lastWindowState: getWindowState(remote.getCurrentWindow()),
    })

    return hasChangedWindowState && remote.getCurrentWindow().isFullScreen()
  }

  public componentWillReceiveProps(nextProps: any) {
    if (this.infoDisappearTimeoutId !== null) {
      clearTimeout(this.infoDisappearTimeoutId)
    }

    if (this.transitionGroupDisappearTimeoutId !== null) {
      clearTimeout(this.transitionGroupDisappearTimeoutId)
    }

    this.infoDisappearTimeoutId = window.setTimeout(
      this.onInfoDisappearTimeout,
      holdDuration,
    )

    this.transitionGroupDisappearTimeoutId = window.setTimeout(
      this.onTransitionGroupDisappearTimeout,
      holdDuration + transitionDuration,
    )

    this.setState({
      renderTransitionGroup: this.showFullScreenNotification(),
      renderInfo: this.showFullScreenNotification(),
    })
  }

  private onInfoDisappearTimeout = () => {
    this.setState({ renderInfo: false })
  }

  private onTransitionGroupDisappearTimeout = () => {
    this.setState({ renderTransitionGroup: false })
  }

  public render () {
    if (!this.state.renderInfo) {
      return null
    }

    const kbdShortcut = __DARWIN__ ? <kbd className='kbd'>⌃⌘F</kbd> : <span><kbd className='kbd'>Esc</kbd> or <kbd className='kbd'>F11</kbd></span>

    return (
      <CSSTransitionGroup
        className='toast-notification-container'
        id='full-screen-info'
        transitionName='zoom-in' component='div'
        transitionAppear={true}
        transitionEnter={false}
        transitionLeave={true}
        transitionAppearTimeout={transitionDuration}
        transitionLeaveTimeout={transitionDuration}
      >
        <div className='toast-notification'>
          Press {kbdShortcut} to exit fullscreen
        </div>
      </CSSTransitionGroup>
    )
  }
}