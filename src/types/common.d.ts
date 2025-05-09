// import './app_setting'

declare namespace LX {
  type OnlineSource = 'kw' | 'kg' | 'tx' | 'wy' | 'mg'
  type Source = OnlineSource | 'local'
  type Quality = '128k' | '320k' | 'flac' | 'hires' | 'atmos' | 'atmos_plus' | 'master'
  type QualityList = Partial<Record<LX.Source, LX.Quality[]>>

  type ShareType = 'system' | 'clipboard'

  type UpdateStatus = 'downloaded' | 'downloading' | 'error' | 'checking' | 'idle'
  interface VersionInfo {
    version: string
    desc: string
  }
}
