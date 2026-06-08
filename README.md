<h1>
    <img src="https://raw.githubusercontent.com/Pipe-Bomb/.github/refs/heads/master/assets/logos/Pipe%20Bomb%20no%20background%20w%20outline.png" width="40" />
    Format Plugin
</h1>

Uses FFprobe to determine audio information for each track.

**Requires the `ffprobe` binary to be added to PATH.** Normally this is already the case, as FFmpeg is required by Pipe Bomb server anyway.

## Attributes

This plugin registers the following track attributes:

| Attribute        | Type      | Multiple | Description                                                                                                                                                                                                                                                                                                         |
| :--------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codec`          | `string`  | ❌       | The codec of the audio inside the container, in lowercase. _E.g. "mp3"_                                                                                                                                                                                                                                             |
| `bitrate`        | `integer` | ❌       | The bit rate of the audio. Only available for some codecs like MP3. _E.g. 320000_                                                                                                                                                                                                                                   |
| `samplerate`     | `integer` | ❌       | The sample rate of the audio. _E.g. 44100_                                                                                                                                                                                                                                                                          |
| `quality_tier`   | `string`  | ❌       | Whether the audio is considered lossless or high resolution. Codecs "flac", "alac", "wav", "pcm_s16le", "pcm_s24le" and "aiff" are considered lossless (value: `lossless`). Lossless audio with a samplerate greater than 48kHz or greater than 16 bits-per-sample is considered high resolution (value: `highres`) |
| `channels`       | `integer` | ❌       | The number of audio channels.                                                                                                                                                                                                                                                                                       |
| `channel_layout` | `string`  | ❌       | The layout of the audio channels. _E.g. "stereo", "5.1"_                                                                                                                                                                                                                                                            |

## Installation

Clone the repo into your [Pipe Bomb server's](https://github.com/pipe-bomb/server) `plugins` directory. Then inside, run:

```bash
npm ci
npm run build
```

## Usage

Because `ffprobe` requires an audio stream, tracks that only provide an HLS audio producer are not supported. In most cases, Requesting for the server to cache these tracks will save them as streams, which this plugin can read. As such, it is recommended to use Format _after_ all HLS tracks have been cached.
