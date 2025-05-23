import { useCallback, useRef } from 'react'

import listState from '@/store/list/state'
import ListMenu, { type ListMenuType, type Position, type SelectInfo } from './ListMenu'
import {
  handleDislikeMusic,
  handlePlay,
  handlePlayLater,
  handleRemove,
  handleShare,
  handleShowMusicSourceDetail,
  handleUpdateMusicInfo,
  handleUpdateMusicPosition,
} from './listAction'
import List, { type ListType } from './List'
import ListMusicAdd, {
  type MusicAddModalType as ListMusicAddType,
} from '@/components/MusicAddModal'
import ListMusicMultiAdd, {
  type MusicMultiAddModalType as ListAddMultiType,
} from '@/components/MusicMultiAddModal'
import { createStyle } from '@/utils/tools'
import { type LayoutChangeEvent, View } from 'react-native'
import ActiveList, { type ActiveListType } from './ActiveList'
import MultipleModeBar, { type SelectMode, type MultipleModeBarType } from './MultipleModeBar'
import ListSearchBar, { type ListSearchBarType } from './ListSearchBar'
import ListMusicSearch, { type ListMusicSearchType } from './ListMusicSearch'
import MusicPositionModal, { type MusicPositionModalType } from './MusicPositionModal'
import MetadataEditModal, {
  type MetadataEditType,
  type MetadataEditProps,
} from '@/components/MetadataEditModal'
import MusicDownloadModal, { type MusicDownloadModalType } from './MusicDownloadModal'
import MusicToggleModal, { type MusicToggleModalType } from './MusicToggleModal'

export default () => {
  const activeListRef = useRef<ActiveListType>(null)
  const listMusicSearchRef = useRef<ListMusicSearchType>(null)
  const listRef = useRef<ListType>(null)
  const multipleModeBarRef = useRef<MultipleModeBarType>(null)
  const listSearchBarRef = useRef<ListSearchBarType>(null)
  const listMusicAddRef = useRef<ListMusicAddType>(null)
  const listMusicMultiAddRef = useRef<ListAddMultiType>(null)
  const musicPositionModalRef = useRef<MusicPositionModalType>(null)
  const musicDownloadModalRef = useRef<MusicDownloadModalType>(null)
  const metadataEditTypeRef = useRef<MetadataEditType>(null)
  const listMenuRef = useRef<ListMenuType>(null)
  const musicToggleModalRef = useRef<MusicToggleModalType>(null)
  const layoutHeightRef = useRef<number>(0)
  const isShowMultipleModeBar = useRef(false)
  const isShowSearchBarModeBar = useRef(false)
  const selectedInfoRef = useRef<SelectInfo>()

  const hancelMultiSelect = useCallback(() => {
    if (isShowSearchBarModeBar.current) {
      multipleModeBarRef.current?.setVisibleBar(false)
    } else activeListRef.current?.setVisibleBar(false)
    isShowMultipleModeBar.current = true
    multipleModeBarRef.current?.show()
    listRef.current?.setIsMultiSelectMode(true)
  }, [])
  const hancelExitSelect = useCallback(() => {
    if (isShowSearchBarModeBar.current) {
      multipleModeBarRef.current?.setVisibleBar(true)
    } else activeListRef.current?.setVisibleBar(true)
    multipleModeBarRef.current?.exitSelectMode()
    listRef.current?.setIsMultiSelectMode(false)
    isShowMultipleModeBar.current = false
  }, [])
  const hancelSwitchSelectMode = useCallback((mode: SelectMode) => {
    multipleModeBarRef.current?.setSwitchMode(mode)
    listRef.current?.setSelectMode(mode)
  }, [])
  const hancelScrollToTop = useCallback(() => {
    listRef.current?.scrollToTop()
  }, [])

  const showMenu = useCallback(
    (musicInfo: LX.Music.MusicInfo, index: number, position: Position) => {
      listMenuRef.current?.show(
        {
          musicInfo,
          index,
          listId: listState.activeListId,
          single: false,
          selectedList: listRef.current!.getSelectedList(),
        },
        position
      )
    },
    []
  )
  const handleShowSearch = useCallback(() => {
    isShowSearchBarModeBar.current = true
    if (isShowMultipleModeBar.current) {
      multipleModeBarRef.current?.setVisibleBar(false)
    } else activeListRef.current?.setVisibleBar(false)
    listSearchBarRef.current?.show()
  }, [])
  const handleExitSearch = useCallback(() => {
    isShowSearchBarModeBar.current = false
    listMusicSearchRef.current?.hide()
    listSearchBarRef.current?.hide()
    // console.log('handleExitSearch', isShowMultipleModeBar.current)
    if (isShowMultipleModeBar.current) {
      multipleModeBarRef.current?.setVisibleBar(true)
    } else activeListRef.current?.setVisibleBar(true)
  }, [])
  const handleScrollToInfo = useCallback(
    (info: LX.Music.MusicInfo) => {
      listRef.current?.scrollToInfo(info)
      handleExitSearch()
    },
    [handleExitSearch]
  )
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    layoutHeightRef.current = e.nativeEvent.layout.height
  }, [])

  const handleAddMusic = useCallback((info: SelectInfo) => {
    if (info.selectedList.length) {
      listMusicMultiAddRef.current?.show({
        selectedList: info.selectedList,
        listId: info.listId,
        isMove: false,
      })
    } else {
      listMusicAddRef.current?.show({
        musicInfo: info.musicInfo,
        listId: info.listId,
        isMove: false,
      })
    }
  }, [])
  const handleMoveMusic = useCallback((info: SelectInfo) => {
    if (info.selectedList.length) {
      listMusicMultiAddRef.current?.show({
        selectedList: info.selectedList,
        listId: info.listId,
        isMove: true,
      })
    } else {
      listMusicAddRef.current?.show({
        musicInfo: info.musicInfo,
        listId: info.listId,
        isMove: true,
      })
    }
  }, [])
  const handleEditMetadata = useCallback((info: SelectInfo) => {
    if (info.musicInfo.source != 'local') return
    selectedInfoRef.current = info
    metadataEditTypeRef.current?.show(info.musicInfo.meta.filePath)
  }, [])
  const handleUpdateMetadata = useCallback<MetadataEditProps['onUpdate']>((info) => {
    if (!selectedInfoRef.current || selectedInfoRef.current.musicInfo.source != 'local') return
    handleUpdateMusicInfo(selectedInfoRef.current.listId, selectedInfoRef.current.musicInfo, info)
  }, [])

  return (
    <View style={styles.container}>
      <View style={{ zIndex: 2 }}>
        <ActiveList
          ref={activeListRef}
          onShowSearchBar={handleShowSearch}
          onScrollToTop={hancelScrollToTop}
        />
        <MultipleModeBar
          ref={multipleModeBarRef}
          onSwitchMode={hancelSwitchSelectMode}
          onSelectAll={(isAll) => listRef.current?.selectAll(isAll)}
          onExitSelectMode={hancelExitSelect}
        />
        <ListSearchBar
          ref={listSearchBarRef}
          onSearch={(keyword) =>
            listMusicSearchRef.current?.search(keyword, layoutHeightRef.current)
          }
          onExitSearch={handleExitSearch}
        />
      </View>
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <List
          ref={listRef}
          onShowMenu={showMenu}
          onMuiltSelectMode={hancelMultiSelect}
          onSelectAll={(isAll) => multipleModeBarRef.current?.setIsSelectAll(isAll)}
        />
        <ListMusicSearch ref={listMusicSearchRef} onScrollToInfo={handleScrollToInfo} />
      </View>
      <ListMusicAdd ref={listMusicAddRef} onAdded={hancelExitSelect} />
      <ListMusicMultiAdd ref={listMusicMultiAddRef} onAdded={hancelExitSelect} />
      <MusicPositionModal
        ref={musicPositionModalRef}
        onUpdatePosition={(info, postion) => {
          handleUpdateMusicPosition(
            postion,
            info.listId,
            info.musicInfo,
            info.selectedList,
            hancelExitSelect
          )
        }}
      />
      <MusicDownloadModal ref={musicDownloadModalRef} onDownloadInfo={(info) => {}} />
      <ListMenu
        ref={listMenuRef}
        onPlay={(info) => {
          handlePlay(info.listId, info.index)
        }}
        onPlayLater={(info) => {
          hancelExitSelect()
          handlePlayLater(info.listId, info.musicInfo, info.selectedList, hancelExitSelect)
        }}
        onRemove={(info) => {
          hancelExitSelect()
          handleRemove(info.listId, info.musicInfo, info.selectedList, hancelExitSelect)
        }}
        onDislikeMusic={(info) => {
          void handleDislikeMusic(info.musicInfo)
        }}
        onCopyName={(info) => {
          handleShare(info.musicInfo)
        }}
        onDownload={(info) => musicDownloadModalRef.current?.show(info.musicInfo)}
        onMusicSourceDetail={(info) => {
          void handleShowMusicSourceDetail(info.musicInfo)
        }}
        onAdd={handleAddMusic}
        onMove={handleMoveMusic}
        onEditMetadata={handleEditMetadata}
        onChangePosition={(info) => musicPositionModalRef.current?.show(info)}
        onToggleSource={(info) => musicToggleModalRef.current?.show(info)}
      />
      <MetadataEditModal ref={metadataEditTypeRef} onUpdate={handleUpdateMetadata} />
      <MusicToggleModal ref={musicToggleModalRef} />
    </View>
  )
}

const styles = createStyle({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
})
