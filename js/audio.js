/**
 * Sulav & Mannu Wedding Invitation
 * Background Music Controller featuring Nepali Panchebaja Wedding Dhun
 * YouTube Audio Source: https://youtu.be/Vj4O_4yGU2g (ID: Vj4O_4yGU2g)
 */

class RoyalWeddingAudio {
  constructor() {
    this.isPlaying = false;
    this.ytPlayer = null;
    this.isReady = false;
    this.shouldAutoplay = false;
    this.audioCtx = null;
    this.videoId = 'Vj4O_4yGU2g'; // Nepali Panchebaja Wedding Ceremony Instrumental

    this.initYouTube();
  }

  initYouTube() {
    // Register global hook for YouTube IFrame API
    window.onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };

    // If API is already present in document
    if (window.YT && window.YT.Player) {
      this.createPlayer();
    } else {
      // Inject official YouTube IFrame API script
      if (!document.getElementById('yt-iframe-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }
    }
  }

  createPlayer() {
    const container = document.getElementById('youtube-audio-player');
    if (!container) return;

    try {
      this.ytPlayer = new YT.Player('youtube-audio-player', {
        height: '1',
        width: '1',
        videoId: this.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          playlist: this.videoId,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3
        },
        events: {
          onReady: (event) => {
            this.isReady = true;
            try {
              this.ytPlayer.setVolume(100);
            } catch (e) {}

            if (this.shouldAutoplay) {
              this.startMusic();
            }
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              this.isPlaying = true;
              this.updateUI(true);
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              this.isPlaying = false;
              this.updateUI(false);
            }
          },
          onError: (err) => {
            console.warn("YouTube player status:", err);
          }
        }
      });
    } catch (e) {
      console.warn("Failed to initialize YouTube Audio Player", e);
    }
  }

  playSealChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const now = this.audioCtx.currentTime;
      const chimeNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      chimeNotes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.85);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.95);
      });
    } catch (e) {}
  }

  startMusic() {
    this.shouldAutoplay = true;

    if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.unMute();
        this.ytPlayer.setVolume(100);
        this.ytPlayer.playVideo();
        this.isPlaying = true;
        this.updateUI(true);
      } catch (e) {
        console.warn("Could not start YouTube audio playback", e);
      }
    }
  }

  stopMusic() {
    this.shouldAutoplay = false;
    this.isPlaying = false;

    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch (e) {}
    }
    this.updateUI(false);
  }

  toggle() {
    if (this.isPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  updateUI(playing) {
    const musicBtn = document.getElementById('music-toggle-btn');
    if (!musicBtn) return;

    if (playing) {
      musicBtn.classList.add('playing');
      const textElem = musicBtn.querySelector('.music-btn-text');
      if (textElem) textElem.textContent = translations.np.musicPlay;
    } else {
      musicBtn.classList.remove('playing');
      const textElem = musicBtn.querySelector('.music-btn-text');
      if (textElem) textElem.textContent = translations.np.musicMute;
    }
  }
}

window.weddingAudio = new RoyalWeddingAudio();
