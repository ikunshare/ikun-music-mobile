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

### v1.8.2 - 歌词加载延时检测优化（稳定版）

#### 🚀 核心优化
- **延时检测机制**：添加歌词加载延时检测，解决歌词加载慢时跳转失效的关键问题
- **智能持续监测**：实现播放位置变化的持续监测和自动重跳转机制

#### 🐛 修复问题
- **时序问题根治**：解决歌词切换瞬间触发跳转，但歌词加载慢导致跳转失效的时序问题
- **慢加载场景**：修复网络慢、歌词文件大、设备性能低等场景下的歌词跳转失败

#### 🔧 技术细节
- **核心机制**：
  - 添加`lyricLoadCheckInterval`持续检测播放位置变化
  - 实现`performLyricJump()`统一跳转逻辑
  - 启动`startLyricLoadCheck()`智能监测机制
  - 最多检测10次（3秒内），确保不影响性能

- **检测逻辑**：
  - 每300ms检测一次播放位置
  - 播放位置变化超过0.5秒时自动重新跳转
  - 区分水平和垂直布局的独立日志标识

- **影响文件**：
  - `src/screens/PlayDetail/Horizontal/Lyric.tsx` - 水平布局延时检测机制
  - `src/screens/PlayDetail/Vertical/Lyric.tsx` - 垂直布局延时检测机制

#### ✨ 优化效果
- 彻底解决歌词加载慢时跳转失效的问题
- 支持网络不稳定、大文件、低性能设备等复杂场景
- 智能检测播放位置变化，实现精准的二次跳转
- 提供详细的调试日志，便于问题排查和性能监控

#### 📝 用户反馈响应
- 解决用户反馈："定位和跳转歌词只发生在歌词切换的瞬间，假如歌词加载慢了就不会跳转了吧？"
- **日期**: 2025-01-09

### v1.8.1 - 歌词缓存机制优化（稳定版）

#### 🚀 新增功能
- **智能歌词缓存**：优化在线歌词下载和本地缓存机制，确保网络不好时也能显示已缓存的歌词
- **离线歌词支持**：完善歌词离线存储功能，提升弱网环境下的用户体验

#### 🐛 修复问题
- **歌词缓存条件过严**：修复`getCachedLyricInfo`函数条件过于严格，导致有缓存也不显示的问题
- **网络异常处理**：解决网络不好时歌词完全不显示的问题，改为优先使用缓存

#### 🔧 技术细节
- **核心优化**：
  - 放宽歌词缓存验证条件，只要有基本歌词内容就返回，不再严格要求翻译歌词
  - 在所有歌词获取失败时增加缓存fallback机制
  - 添加详细的调试日志，便于问题排查

- **影响文件**：
  - `src/core/music/utils.ts` - 核心歌词缓存逻辑优化
  - `src/core/music/local.ts` - 本地歌曲歌词缓存增强
  - `src/core/music/online.ts` - 在线歌曲歌词缓存增强
  - `src/core/music/download.ts` - 下载歌曲歌词缓存增强

#### ✨ 优化效果
- 网络不稳定时，自动使用缓存的歌词，避免空白显示
- 大幅提升弱网环境下的歌词显示成功率
- 减少因网络问题导致的歌词跳转不稳定现象
- 提升整体用户体验，特别是在网络条件不佳的环境下

#### 📝 用户反馈响应
- 解决用户反馈："能不能把在线的歌词下载下来，不然网络不好的时候不显示歌词了"
- **日期**: 2025-01-09

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
