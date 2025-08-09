<p align="center"><a href="https://github.com/lyswhut/lx-music-mobile"><img width="200" src="https://github.com/lyswhut/lx-music-mobile/blob/master/doc/images/icon.png" alt="lx-music logo"></a></p>

<h1 align="center">LX Music 移动版</h1>

<p align="center">
  <a href="https://github.com/lyswhut/lx-music-mobile/releases"><img src="https://img.shields.io/github/release/lyswhut/lx-music-mobile" alt="Release version"></a>
  <a href="https://github.com/lyswhut/lx-music-mobile/actions/workflows/release.yml"><img src="https://github.com/lyswhut/lx-music-mobile/workflows/Build/badge.svg" alt="Build status"></a>
  <a href="https://github.com/lyswhut/lx-music-mobile/actions/workflows/beta-pack.yml"><img src="https://github.com/lyswhut/lx-music-mobile/workflows/Build%20Beta/badge.svg" alt="Build status"></a>
  <a href="https://github.com/facebook/react-native"><img src="https://img.shields.io/github/package-json/dependency-version/lyswhut/lx-music-mobile/react-native/master" alt="React native version"></a>
  <a href="https://github.com/lyswhut/lx-music-mobile/tree/dev"><img src="https://img.shields.io/github/package-json/v/lyswhut/lx-music-mobile/dev" alt="Dev branch version"></a>
</p>

<p align="center">一个基于 React Native 开发的音乐软件</p>

## 说明

本软件基于 LX Music 修改

增加了一些音质

并添加简易下载功能

由于营销号的过分宣传导致原有部分功能被删减

## 最近更新

### v1.8.0 - 歌词显示优化修复（稳定版）

#### 🐛 修复问题
- **本地歌曲歌词跳转问题**：修复切换本地歌曲时，歌词不能自动跳转到当前播放位置的问题
- **歌词跳转不稳定问题**：解决有时能跳转有时不能的不稳定情况

#### 🔧 技术细节
- **问题根因**：歌词组件在新歌词加载完成后，强制跳转到第0行，忽略了当前播放进度
- **第一轮修复**：将固定跳转逻辑改为动态跳转
- **第二轮修复**：增加智能播放位置获取，解决首次播放问题
- **第三轮修复**：优化跳转逻辑可靠性，移除严格条件判断，增加调试日志
- **影响文件**：
  - `src/screens/PlayDetail/Horizontal/Lyric.tsx` - 水平布局歌词组件
  - `src/screens/PlayDetail/Vertical/Lyric.tsx` - 垂直布局歌词组件

#### ✨ 修复效果
- 切换本地歌曲时，歌词会自动跳转到当前播放时间对应的位置
- 解决首次播放时歌词停留在第一行的问题
- 大幅提升跳转成功率，解决不稳定的情况
- 歌词显示与播放进度保持完美同步
- 提升了用户的歌词查看体验

#### 📝 提交记录
- **v1.7.8**: `8bf4ebf` - 基础跳转逻辑修复
- **v1.7.9**: `1525bca` - 智能播放位置获取
- **v1.8.0**: 优化跳转稳定性和可靠性
- **日期**: 2025-01-09
