interface Player {
    currentTime: number;
    // 其他可能的属性和方法
}

declare global {
    var player: Player; // 确保 global.player 的类型是 Player
}

import {
  init as initLyricPlayer,
  toggleTranslation,
  toggleRoma,
  play,
  pause,
  stop,
  setLyric,
  setPlaybackRate,
} from '@/core/lyric';
import { updateSetting } from '@/core/common';
import {
  onDesktopLyricPositionChange,
  showDesktopLyric,
  onLyricLinePlay,
  showRemoteLyric,
} from '@/core/desktopLyric';
import playerState from '@/store/player/state';
import { updateNowPlayingTitles } from '@/plugins/player/utils';
import { setLastLyric } from '@/core/player/playInfo';
import { state } from '@/plugins/player/playList';

const setPlaybackPosition = async (timestamp: number) => {
    if (global.player) {
        global.player.currentTime = timestamp; // 设置播放器当前时间
        global.app_event?.setProgress(timestamp / 1000); // 更新播放进度
        global.app_event?.lyricUpdated(); // 更新歌词事件
    }
};

const parseLyricTimestamp = (lyric: string): number | null => {
    const match = lyric.match(/\\[(\\d{2}):(\\d{2})\\]/);
    if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        return (minutes * 60 + seconds) * 1000; // 转换为毫秒
    }
    return null;
};

const updateRemoteLyric = async (lrc?: string) => {
    setLastLyric(lrc);
    if (lrc) {
        const currentTimestamp = parseLyricTimestamp(lrc);
        if (currentTimestamp) {
            await setPlaybackPosition(currentTimestamp); // 设置播放位置
        }
    }
};

export default async (setting: LX.AppSetting) => {
    await initLyricPlayer();
    await Promise.all([
        setPlaybackRate(setting['player.playbackRate']),
        toggleTranslation(setting['player.isShowLyricTranslation']),
        toggleRoma(setting['player.isShowLyricRoma']),
    ]);

    if (setting['desktopLyric.enable']) {
        showDesktopLyric().catch(() => {
            updateSetting({ 'desktopLyric.enable': false });
        });
    }
    if (setting['player.isShowBluetoothLyric']) {
        showRemoteLyric(true).catch(() => {
            updateSetting({ 'player.isShowBluetoothLyric': false });
        });
    }
    onDesktopLyricPositionChange((position) => {
        updateSetting({
            'desktopLyric.position.x': position.x,
            'desktopLyric.position.y': position.y,
        });
    });
    onLyricLinePlay(({ text }) => {
        if (!text && !state.isPlaying) {
            void updateRemoteLyric();
        } else {
            void updateRemoteLyric(text);
        }
    });

    global.app_event?.on?.('play', () => {
        // 延迟执行,确保播放器位置已更新
        setTimeout(() => {
            play();
        }, 300);
    });
    global.app_event?.on?.('pause', pause);
    global.app_event?.on?.('stop', stop);
    global.app_event?.on?.('error', pause);
    global.app_event?.on?.('musicToggled', stop);
    global.app_event?.on?.('lyricUpdated', setLyric);
};
