import {
  play as lrcPlay,
  setLyric as lrcSetLyric,
  pause as lrcPause,
  setPlaybackRate as lrcSetPlaybackRate,
  toggleTranslation as lrcToggleTranslation,
  toggleRoma as lrcToggleRoma,
  init as lrcInit,
} from '@/plugins/lyric'
import {
  playDesktopLyric,
  setDesktopLyric,
  pauseDesktopLyric,
  setDesktopLyricPlaybackRate,
  toggleDesktopLyricTranslation,
  toggleDesktopLyricRoma,
} from '@/core/desktopLyric'
import { getPosition } from '@/plugins/player'
import TrackPlayer, { State as TPState } from 'react-native-track-player'
import playerState from '@/store/player/state'
// import settingState from '@/store/setting/state'

/**
 * init lyric
 */
export const init = async () => {
  return lrcInit()
}

/**
 * set lyric
 * @param lyric lyric str
 * @param translation lyric translation
 */
const handleSetLyric = async (lyric: string, translation = '', romalrc = '') => {
  lrcSetLyric(lyric, translation, romalrc)
  await setDesktopLyric(lyric, translation, romalrc)
}

/**
 * play lyric
 * @param time play time
 */
export const handlePlay = (time: number) => {
  lrcPlay(time)
  void playDesktopLyric(time)
}

/**
 * pause lyric
 */
export const pause = () => {
  lrcPause()
  void pauseDesktopLyric()
}

/**
 * stop lyric
 */
export const stop = () => {
  void handleSetLyric('')
}

/**
 * set playback rate
 * @param playbackRate playback rate
 */
export const setPlaybackRate = async (playbackRate: number) => {
  lrcSetPlaybackRate(playbackRate)
  await setDesktopLyricPlaybackRate(playbackRate)
  if (playerState.isPlay) {
    setTimeout(() => {
      void getPosition().then((position) => {
        handlePlay(position * 1000)
      })
    })
  }
}

/**
 * toggle show translation
 * @param isShowTranslation is show translation
 */
export const toggleTranslation = async (isShowTranslation: boolean) => {
  lrcToggleTranslation(isShowTranslation)
  await toggleDesktopLyricTranslation(isShowTranslation)
  if (playerState.isPlay) play()
}

/**
 * toggle show roma lyric
 * @param isShowLyricRoma is show roma lyric
 */
export const toggleRoma = async (isShowLyricRoma: boolean) => {
  lrcToggleRoma(isShowLyricRoma)
  await toggleDesktopLyricRoma(isShowLyricRoma)
  if (playerState.isPlay) play()
}

export const play = () => {
  void getPosition().then((position) => {
    handlePlay(position * 1000)
  })
}

export const setLyric = async () => {
  if (!playerState.musicInfo.id) return
  if (playerState.musicInfo.lrc) {
    let tlrc = ''
    let rlrc = ''
    if (playerState.musicInfo.tlrc) tlrc = playerState.musicInfo.tlrc
    if (playerState.musicInfo.rlrc) rlrc = playerState.musicInfo.rlrc
    await handleSetLyric(playerState.musicInfo.lrc, tlrc, rlrc)
  }

  // 修复:歌词加载完成后,等待并多次尝试同步
  // 问题根源:本地歌曲首次播放时,歌词加载可能在播放器position更新之前完成
  // 采用轮询策略:每隔200ms检查一次,直到position>0.1或超过最大尝试次数(5秒)
  let attempts = 0
  const maxAttempts = 25  // 25次 * 200ms = 5秒
  const trySync = async () => {
    try {
      const playbackState = await TrackPlayer.getState()
      if (playbackState !== TPState.Playing && playbackState !== TPState.Buffering) {
        // 如果不在播放或缓冲状态，继续尝试
        if (attempts < maxAttempts) {
          attempts++
          setTimeout(trySync, 200)
        }
        return
      }
      
      const position = await getPosition()
      if (position > 0.1 || attempts >= maxAttempts) {
        // position已经大于0.1秒,或者已达到最大尝试次数,进行同步
        console.log('歌词同步成功, position:', position, 'attempts:', attempts)
        handlePlay(position * 1000)
        return
      }
      
      // position还是0或很小,继续等待
      attempts++
      setTimeout(trySync, 200)
    } catch (error) {
      console.log('setLyric同步失败:', error)
      // 出错时也继续尝试，直到达到最大尝试次数
      if (attempts < maxAttempts) {
        attempts++
        setTimeout(trySync, 200)
      }
    }
  }
  
  // 立即尝试一次同步，然后再开始轮询
  trySync()
}
