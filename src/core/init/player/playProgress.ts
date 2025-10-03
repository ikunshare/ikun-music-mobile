import { updateListMusics } from '@/core/list'
import { setMaxplayTime, setNowPlayTime } from '@/core/player/progress'
import { setCurrentTime, getDuration, getPosition } from '@/plugins/player'
import { formatPlayTime2 } from '@/utils/common'
import { savePlayInfo } from '@/utils/data'
import { throttleBackgroundTimer } from '@/utils/tools'
import BackgroundTimer from 'react-native-background-timer'
import playerState from '@/store/player/state'
import settingState from '@/store/setting/state'
import { onScreenStateChange } from '@/utils/nativeModules/utils'
import { AppState } from 'react-native'
import { handlePlay as lyricHandlePlay } from '@/core/lyric'

const delaySavePlayInfo = throttleBackgroundTimer(() => {
  void savePlayInfo({
    time: playerState.progress.nowPlayTime,
    maxTime: playerState.progress.maxPlayTime,
    listId: playerState.playMusicInfo.listId!,
    index: playerState.playInfo.playIndex,
  })
}, 2000)

export default () => {
  // const updateMusicInfo = useCommit('list', 'updateMusicInfo')

  let updateTimeout: number | null = null
  let lyricSyncTimeout: number | null = null  // 歌词同步超时处理
  let hasTriggeredLyricSync = false  // 是否已触发歌词同步

  let isScreenOn = true

  const getCurrentTime = () => {
    let id = playerState.musicInfo.id
    void getPosition().then((position) => {
      if (!position || id != playerState.musicInfo.id) return
      setNowPlayTime(position)
      if (!playerState.isPlay) return
      // 同步歌词到当前播放位置，确保本地歌曲首次播放能正确推进
      // 添加日志以便调试歌词同步问题
      if (position > 0.1) {
        lyricHandlePlay(position * 1000)
        // 标记已触发歌词同步，避免执行备用方案
        if (!hasTriggeredLyricSync && lyricSyncTimeout) {
          hasTriggeredLyricSync = true
          BackgroundTimer.clearTimeout(lyricSyncTimeout)
          lyricSyncTimeout = null
          console.log('歌词同步已成功，取消备用方案')
        }
      }

      if (
        settingState.setting['player.isSavePlayTime'] &&
        !playerState.playMusicInfo.isTempPlay &&
        isScreenOn
      ) {
        delaySavePlayInfo()
      }
    })
  }
  const getMaxTime = async () => {
    setMaxplayTime(await getDuration())

    if (
      playerState.playMusicInfo.musicInfo &&
      'source' in playerState.playMusicInfo.musicInfo &&
      !playerState.playMusicInfo.musicInfo.interval
    ) {
      // console.log(formatPlayTime2(playProgress.maxPlayTime))

      if (playerState.playMusicInfo.listId) {
        void updateListMusics([
          {
            id: playerState.playMusicInfo.listId,
            musicInfo: {
              ...playerState.playMusicInfo.musicInfo,
              interval: formatPlayTime2(playerState.progress.maxPlayTime),
            },
          },
        ])
      }
    }
  }

  const clearUpdateTimeout = () => {
    if (!updateTimeout) return
    BackgroundTimer.clearInterval(updateTimeout)
    updateTimeout = null
  }
  const startUpdateTimeout = () => {
    if (!isScreenOn) return
    clearUpdateTimeout()
    updateTimeout = BackgroundTimer.setInterval(() => {
      getCurrentTime()
    }, 1000 / settingState.setting['player.playbackRate'])
    getCurrentTime()
  }

  const setProgress = (time: number, maxTime?: number) => {
    if (!playerState.musicInfo.id) return
    // console.log('setProgress', time, maxTime)
    setNowPlayTime(time)
    void setCurrentTime(time)
    // 进度变更时立即同步歌词，修复拖动/首次播放时的歌词停滞
    // 只有当时间大于0.1秒时才同步歌词，避免position为0时导致歌词卡在第一行
    if (time > 0.1) {
      lyricHandlePlay(time * 1000)
    }

    if (maxTime != null) setMaxplayTime(maxTime)

    // if (!isPlay) audio.play()
  }

  const handlePlay = () => {
    void getMaxTime()
    // prevProgressStatus = 'normal'
    // handleSetTaskBarState(playProgress.progress, prevProgressStatus)
    startUpdateTimeout()
    
    // 重置歌词同步标志
    hasTriggeredLyricSync = false
    
    // 清除之前的歌词同步超时
    if (lyricSyncTimeout) {
      BackgroundTimer.clearTimeout(lyricSyncTimeout)
      lyricSyncTimeout = null
    }
    
    // 设置2秒后的歌词同步超时处理
    lyricSyncTimeout = BackgroundTimer.setTimeout(() => {
      // 如果2秒后还没有触发过歌词同步，则执行短暂暂停再恢复的操作
      if (!hasTriggeredLyricSync && playerState.isPlay && playerState.musicInfo.id) {
        console.log('执行歌词同步备用方案: 短暂暂停后恢复')
        
        // 记录当前播放位置
        void getPosition().then((position) => {
          if (position > 0.1) {
            // 短暂暂停
            global.app_event?.pause?.()
            
            // 100ms后立即恢复播放，确保歌词同步
            BackgroundTimer.setTimeout(() => {
              if (playerState.musicInfo.id) {
                global.app_event?.play?.()
                console.log('歌词同步备用方案执行完成')
              }
            }, 100)
          }
        })
      }
    }, 2000)
  }
  const handlePause = () => {
    // prevProgressStatus = 'paused'
    // handleSetTaskBarState(playProgress.progress, prevProgressStatus)
    // clearBufferTimeout()
    clearUpdateTimeout()
    
    // 清除歌词同步超时
    if (lyricSyncTimeout) {
      BackgroundTimer.clearTimeout(lyricSyncTimeout)
      lyricSyncTimeout = null
    }
  }

  const handleStop = () => {
    clearUpdateTimeout()
    setNowPlayTime(0)
    setMaxplayTime(0)
    // prevProgressStatus = 'none'
    // handleSetTaskBarState(playProgress.progress, prevProgressStatus)
    
    // 清除歌词同步超时
    if (lyricSyncTimeout) {
      BackgroundTimer.clearTimeout(lyricSyncTimeout)
      lyricSyncTimeout = null
    }
    hasTriggeredLyricSync = false
  }

  const handleError = () => {
    // if (!restorePlayTime) restorePlayTime = getCurrentTime() // 记录出错的播放时间
    // console.log('handleError')
    // prevProgressStatus = 'error'
    // handleSetTaskBarState(playProgress.progress, prevProgressStatus)
    clearUpdateTimeout()
  }

  const handleSetPlayInfo = () => {
    // restorePlayTime = playProgress.nowPlayTime
    // void setCurrentTime(playerState.progress.nowPlayTime)
    // setMaxplayTime(playProgress.maxPlayTime)
    handlePause()
    if (!playerState.playMusicInfo.isTempPlay) {
      void savePlayInfo({
        time: playerState.progress.nowPlayTime,
        maxTime: playerState.progress.maxPlayTime,
        listId: playerState.playMusicInfo.listId!,
        index: playerState.playInfo.playIndex,
      })
    }
  }

  // watch(() => playerState.progress.nowPlayTime, (newValue, oldValue) => {
  //   if (settingState.setting['player.isSavePlayTime'] && !playMusicInfo.isTempPlay) {
  //     delaySavePlayInfo({
  //       time: newValue,
  //       maxTime: playerState.progress.maxPlayTime,
  //       listId: playMusicInfo.listId as string,
  //       index: playInfo.playIndex,
  //     })
  //   }
  // })
  // watch(() => playerState.progress.maxPlayTime, maxPlayTime => {
  //   if (!playMusicInfo.isTempPlay) {
  //     delaySavePlayInfo({
  //       time: playerState.progress.nowPlayTime,
  //       maxTime: maxPlayTime,
  //       listId: playMusicInfo.listId as string,
  //       index: playInfo.playIndex,
  //     })
  //   }
  // })

  const handleConfigUpdated: typeof global.state_event.configUpdated = (keys, settings) => {
    if (keys.includes('player.playbackRate')) startUpdateTimeout()
  }

  const handleScreenStateChanged: Parameters<typeof onScreenStateChange>[0] = (state) => {
    isScreenOn = state == 'ON'
    if (isScreenOn) {
      if (playerState.isPlay) startUpdateTimeout()
    } else clearUpdateTimeout()
  }

  // 修复在某些设备上屏幕状态改变事件未触发导致的进度条未更新的问题
  AppState.addEventListener('change', (state) => {
    if (state == 'active' && !isScreenOn) handleScreenStateChanged('ON')
  })

  global.app_event?.on?.('play', handlePlay)
  global.app_event?.on?.('pause', handlePause)
  global.app_event?.on?.('stop', handleStop)
  global.app_event?.on?.('error', handleError)
  global.app_event?.on?.('setProgress', setProgress)
  // global.app_event.on(eventPlayerNames.restorePlay, handleRestorePlay)
  // global.app_event.on('playerLoadeddata', handleLoadeddata)
  // global.app_event.on('playerCanplay', handleCanplay)
  // global.app_event.on('playerWaiting', handleWating)
  // global.app_event.on('playerEmptied', handleEmpied)
  global.app_event?.on?.('musicToggled', handleSetPlayInfo)
  global.state_event?.on?.('configUpdated', handleConfigUpdated)

  onScreenStateChange(handleScreenStateChanged)
}
