// import { store } from '@/store'
// import { getDownloadFilePath } from '@renderer/utils/music'

import {
  getMusicUrl as getOnlineMusicUrl,
  getPicUrl as getOnlinePicUrl,
  getLyricInfo as getOnlineLyricInfo,
} from './online'
import { buildLyricInfo, getCachedLyricInfo } from './utils'

export const getMusicUrl = async ({
  musicInfo,
  isRefresh,
  allowToggleSource = true,
  onToggleSource = () => {},
}: {
  musicInfo: LX.Download.ListItem
  isRefresh: boolean
  onToggleSource?: (musicInfo?: LX.Music.MusicInfoOnline) => void
  allowToggleSource?: boolean
}): Promise<string> => {
  // if (!isRefresh) {
  //   const path = await getDownloadFilePath(musicInfo, appSetting['download.savePath'])
  //   if (path) return path
  // }

  return getOnlineMusicUrl({
    musicInfo: musicInfo.metadata.musicInfo,
    isRefresh,
    onToggleSource,
    allowToggleSource,
  })
}

export const getPicUrl = async ({
  musicInfo,
  isRefresh,
  listId,
  onToggleSource = () => {},
}: {
  musicInfo: LX.Download.ListItem
  isRefresh: boolean
  listId?: string | null
  onToggleSource?: (musicInfo?: LX.Music.MusicInfoOnline) => void
}): Promise<string> => {
  if (!isRefresh) {
    // const path = await getDownloadFilePath(musicInfo, appSetting['download.savePath'])
    // if (path) {
    //   const pic = await global.lx.worker.main.getMusicFilePic(path)
    //   if (pic) return pic
    // }

    const onlineMusicInfo = musicInfo.metadata.musicInfo
    if (onlineMusicInfo.meta.picUrl) return onlineMusicInfo.meta.picUrl
  }

  return getOnlinePicUrl({
    musicInfo: musicInfo.metadata.musicInfo,
    isRefresh,
    onToggleSource,
  }).then((url) => {
    // TODO: when listId required save url (update downloadInfo)

    return url
  })
}

export const getLyricInfo = async ({
  musicInfo,
  isRefresh,
  onToggleSource = () => {},
}: {
  musicInfo: LX.Download.ListItem
  isRefresh: boolean
  onToggleSource?: (musicInfo?: LX.Music.MusicInfoOnline) => void
}): Promise<LX.Player.LyricInfo> => {
  if (!isRefresh) {
    const lyricInfo = await getCachedLyricInfo(musicInfo.metadata.musicInfo)
    if (lyricInfo) return buildLyricInfo(lyricInfo)
  }

  return getOnlineLyricInfo({
    musicInfo: musicInfo.metadata.musicInfo,
    isRefresh,
    onToggleSource,
  }).catch(async (error) => {
    console.log('下载歌曲在线歌词获取失败，尝试使用缓存:', error)
    
    // 尝试读取文件内歌词
    // const path = await getDownloadFilePath(musicInfo, appSetting['download.savePath'])
    // if (path) {
    //   const rawlrcInfo = await window.lx.worker.main.getMusicFileLyric(path)
    //   if (rawlrcInfo) return buildLyricInfo(rawlrcInfo)
    // }

    // 在线获取失败时，尝试使用缓存的歌词
    const cachedLyricInfo = await getCachedLyricInfo(musicInfo.metadata.musicInfo)
    if (cachedLyricInfo?.lyric) {
      console.log('使用缓存的下载歌曲歌词')
      return buildLyricInfo(cachedLyricInfo)
    }

    // 如果连缓存都没有，返回空歌词
    console.log('下载歌曲无可用的歌词缓存，返回空歌词')
    return buildLyricInfo({ lyric: '' })
  })
}
