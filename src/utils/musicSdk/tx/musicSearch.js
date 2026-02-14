import {httpFetch} from '../../request'
import {formatPlayTime, sizeFormate} from '../../index'
import {formatSingerName} from '../utils'

export default {
  limit: 50,
  total: 0,
  page: 0,
  allPage: 1,
  successCode: 0,
  musicSearch(str, page, limit, retryNum = 0) {
    if (retryNum > 5) return Promise.reject(new Error('搜索失败'))
    const searchRequest = httpFetch('https://u.y.qq.com/cgi-bin/musicu.fcg', {
      method: 'post',
      headers: {
        'User-Agent': 'QQMusic 14090508(android 12)',
      },
      body: {
        "comm": {
          "fPersonality": "0",
          "tmeLoginMethod": "0",
          "tmeLoginType": "0",
          "ct": "19",
          "v": "90",
          "cv": "101805"
        },
        "req": {
          "module": "music.search.SearchBrokerCgiServer",
          "method": "DoSearchForQQMusicMobile",
          "param": {
            "query": str,
            "highlight": 0,
            "searchid": this.getSearchId(),
            "search_type": 0,
            "page_num": page,
            "num_per_page": limit,
            "grp": 1
          }
        }
      }
    })
    return searchRequest.promise.then(({body}) => {
      if (body.code !== this.successCode || body.req.code !== this.successCode)
        return this.musicSearch(str, page, limit, ++retryNum)
      return body.req.data
    })
  },
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },
  getSearchId() {
    const e = this.randomInt(1, 20)
    const t = Number(e * Number('18014398509481984').toFixed())
    const n = this.randomInt(0, 4194304) * 4294967296
    const a = Date.now()
    const r = Math.round(a * 1000) % (24 * 60 * 60 * 1000)
    return String(t + n + r)
  },
  handleResult(rawList) {
    const list = []
    rawList.forEach((item) => {
      if (!item.file?.media_mid) return

      let types = []
      let _types = {}
      const file = item.file
      if (file.size_128mp3 != 0) {
        let size = sizeFormate(file.size_128mp3)
        types.push({type: '128k', size})
        _types['128k'] = {
          size,
        }
      }
      if (file.size_320mp3 !== 0) {
        let size = sizeFormate(file.size_320mp3)
        types.push({type: '320k', size})
        _types['320k'] = {
          size,
        }
      }
      if (file.size_flac !== 0) {
        let size = sizeFormate(file.size_flac)
        types.push({type: 'flac', size})
        _types.flac = {
          size,
        }
      }
      if (file.size_hires !== 0) {
        let size = sizeFormate(file.size_hires)
        types.push({type: 'hires', size})
        _types.hires = {
          size,
        }
      }
      if (file.size_new[1] !== 0) {
        let size = sizeFormate(file.size_new[1])
        types.push({type: 'atmos', size})
        _types.atmos = {
          size,
        }
      }
      if (file.size_new[2] !== 0) {
        let size = sizeFormate(file.size_new[2])
        types.push({type: 'atmos_plus', size})
        _types.atmos_plus = {
          size,
        }
      }
      if (file.size_new[0] !== 0) {
        let size = sizeFormate(file.size_new[0])
        types.push({type: 'master', size})
        _types.master = {
          size,
        }
      }

      let albumId = ''
      let albumName = ''
      if (item.album) {
        albumName = item.album.name
        albumId = item.album.mid
      }
      list.push({
        singer: formatSingerName(item.singer, 'name'),
        name: item.name + (item.title_extra ?? ''),
        albumName,
        albumId,
        source: 'tx',
        interval: formatPlayTime(item.interval),
        songId: item.id,
        albumMid: item.album?.mid ?? '',
        strMediaMid: item.file.media_mid,
        songmid: item.mid,
        img:
          albumId === '' || albumId === '空'
            ? item.singer?.length
              ? `https://y.gtimg.cn/music/photo_new/T001R500x500M000${item.singer[0].mid}.jpg`
              : ''
            : `https://y.gtimg.cn/music/photo_new/T002R500x500M000${albumId}.jpg`,
        types,
        _types,
        typeUrl: {},
      })
    })
    return list
  },
  search(str, page = 1, limit) {
    if (limit == null) limit = this.limit
    return this.musicSearch(str, page, limit).then(({body, meta}) => {
      let list = this.handleResult(body.item_song)

      this.total = meta.estimate_sum
      this.page = page
      this.allPage = Math.ceil(this.total / limit)

      return Promise.resolve({
        list,
        allPage: this.allPage,
        limit,
        total: this.total,
        source: 'tx',
      })
    })
  },
}
