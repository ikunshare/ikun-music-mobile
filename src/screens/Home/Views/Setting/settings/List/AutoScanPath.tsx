import { memo, useRef, useState } from 'react'
import { View } from 'react-native'
import { useI18n } from '@/lang'
import SubTitle from '../../components/SubTitle'
import Button from '@/components/common/Button'
import ChoosePath, { type ChoosePathType } from '@/components/common/ChoosePath'
import { updateSetting } from '@/core/common'
import { useSettingValue } from '@/store/setting/hook'
import { toast } from '@/utils/tools'

const AutoScanPath = () => {
  const t = useI18n()
  const choosePathRef = useRef<ChoosePathType>(null)
  const [visible, setVisible] = useState(false)
  const autoScanPaths = useSettingValue('list.autoScanPaths')

  const handleChoosePath = () => {
    choosePathRef.current?.show({
      title: t('setting_list_auto_scan_path_title'),
      dirOnly: true,
    })
  }

  const onConfirmPath = (path: string) => {
    const newPaths = [...(autoScanPaths || []), path]
    updateSetting({ 'list.autoScanPaths': newPaths })
    toast(t('setting_list_auto_scan_path_add_success'))
    setVisible(false)
  }

  return (
    <>
      <SubTitle title={t('setting_list_auto_scan_path')}>
        <View>
          {autoScanPaths?.map((path: string) => (
            <Button key={path} onPress={() => {
              const newPaths = autoScanPaths.filter((p: string) => p !== path)
              updateSetting({ 'list.autoScanPaths': newPaths })
              toast(t('setting_list_auto_scan_path_remove_success'))
            }}>
              {path}
            </Button>
          ))}
          <Button onPress={() => setVisible(true)}>
            {t('setting_list_auto_scan_path_add')}
          </Button>
        </View>
      </SubTitle>
      {visible ? <ChoosePath ref={choosePathRef} onConfirm={onConfirmPath} /> : null}
    </>
  )
}

export default memo(AutoScanPath)