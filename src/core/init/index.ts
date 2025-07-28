import { initSetting, showPactModal } from '@/core/common'
import registerPlaybackService from '@/plugins/player/service'
import initTheme from './theme'
import initI18n from './i18n'
import initUserApi from './userApi'
import initPlayer from './player'
import dataInit from './dataInit'
import initSync from './sync'
import initCommonState from './common'
import { initDeeplink } from './deeplink'
import { setApiSource } from '@/core/apiSource'
import commonActions from '@/store/common/action'
import settingState from '@/store/setting/state'
import { checkUpdate } from '@/core/version'
import { bootLog } from '@/utils/bootLog'
import { cheatTip } from '@/utils/tools'
import { handleImportMediaFile } from '@/screens/Home/Views/Mylist/MyList/listAction'
import { getUserLists } from '@/core/list'
import { LIST_IDS } from '@/config/constant'

const initAutoScan = async () => {
  const autoScanPaths = settingState.setting['list.autoScanPaths']
  if (!autoScanPaths?.length) return

  const listId = 'auto_scan_list'
  const userLists = await getUserLists()
  let localList = userLists.find(l => l.id === listId)
  if (!localList) {
    // 如果本地列表不存在，则创建一个
    const newList = {
      name: '我的本地音乐',
      id: listId,
      source: 'local' as const,
      sourceListId: '',
      list: [],
      position: -1,
      locationUpdateTime: null,
    }
    // @ts-expect-error
    await global.list_event.createUserList([newList])
    localList = newList
  }


  for (const path of autoScanPaths) {
    await handleImportMediaFile(localList, path)
  }
}

let isFirstPush = true
const handlePushedHomeScreen = async () => {
  await cheatTip()
  if (settingState.setting['common.isAgreePact']) {
    if (isFirstPush) {
      isFirstPush = false
      void checkUpdate()
      void initDeeplink()
    }
  } else {
    if (isFirstPush) isFirstPush = false
    showPactModal()
  }
}

let isInited = false
export default async () => {
  if (isInited) return handlePushedHomeScreen
  bootLog('Initing...')
  commonActions.setFontSize(global.lx.fontSize)
  bootLog('Font size changed.')
  const setting = await initSetting()
  bootLog('Setting inited.')
  // console.log(setting)

  await initTheme(setting)
  bootLog('Theme inited.')
  await initI18n(setting)
  bootLog('I18n inited.')

  await initUserApi(setting)
  bootLog('User Api inited.')

  setApiSource(setting['common.apiSource'])
  bootLog('Api inited.')

  registerPlaybackService()
  bootLog('Playback Service Registered.')
  await initPlayer(setting)
  bootLog('Player inited.')
  await dataInit(setting)
  bootLog('Data inited.')
  await initCommonState(setting)
  bootLog('Common State inited.')

  void initAutoScan()
  bootLog('Auto Scan inited.')

  void initSync(setting)
  bootLog('Sync inited.')

  // syncSetting()

  isInited ||= true

  return handlePushedHomeScreen
}
