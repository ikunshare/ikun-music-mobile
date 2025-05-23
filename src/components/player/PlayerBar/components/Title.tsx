import { TouchableOpacity } from 'react-native'
import { navigations } from '@/navigation'
import { usePlayerMusicInfo } from '@/store/player/hook'
// import { toast } from '@/utils/tools'
import { useSettingValue } from '@/store/setting/hook'
import { useTheme } from '@/store/theme/hook'
import commonState from '@/store/common/state'
import playerState from '@/store/player/state'
import Text from '@/components/common/Text'
import { LIST_IDS } from '@/config/constant'
import { createStyle } from '@/utils/tools'

export default ({ isHome }: { isHome: boolean }) => {
  // const { t } = useTranslation()
  const musicInfo = usePlayerMusicInfo()
  const downloadFileName = useSettingValue('download.fileName')
  const theme = useTheme()

  const handlePress = () => {
    // console.log('')
    // console.log(playMusicInfo)
    if (!musicInfo.id) return
    navigations.pushPlayDetailScreen(commonState.componentIds.home!)
    // toast(global.i18n.t('play_detail_todo_tip'), 'long')
  }

  const handleLongPress = () => {
    const listId = playerState.playMusicInfo.listId
    if (!listId || listId == LIST_IDS.DOWNLOAD) return
    global.app_event.jumpListPosition()
  }
  // console.log('render title')

  const title = musicInfo.id
    ? musicInfo.singer
      ? downloadFileName.replace('歌手', musicInfo.singer).replace('歌名', musicInfo.name)
      : musicInfo.name
    : ''
  // console.log(playMusicInfo)
  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={handleLongPress}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text color={theme['c-font-label']} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}
// const Singer = () => {
//   const playMusicInfo = useGetter('player', 'playMusicInfo')
//   return (
//     <View style={{ flexGrow: 0, flexShrink: 0 }}>
//       <Text style={{ width: '100%', color: AppColors.normal }} numberOfLines={1}>
//         {playMusicInfo ? playMusicInfo.musicInfo.singer : ''}
//       </Text>
//     </View>
//   )
// }
// const MusicName = () => {
//   const playMusicInfo = useGetter('player', 'playMusicInfo')
//   return (
//     <View style={{ flexGrow: 0, flexShrink: 1 }}>
//       <Text style={{ width: '100%', color: AppColors.normal }} numberOfLines={1}>
//         {playMusicInfo ? playMusicInfo.musicInfo.name : '^-^'}
//       </Text>
//     </View>
//   )
// }

const styles = createStyle({
  container: {
    width: '100%',
    paddingHorizontal: 2,
    // paddingBottom: 4,
    // height: '50%',
    // backgroundColor: 'rgba(0, 0, 0, .1)',
  },
})
