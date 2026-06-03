import {
	AlbumInformationHelper,
	AlbumMetadata,
	ArtistInformationHelper,
	ArtistMetadata,
	AttributeSource,
	AttributeSourceApiContext,
	AttributeValue,
	TrackAttributionHelper,
	TrackMetadata,
} from "@sdk";
import { spawn } from "child_process";
import { FFprobeAudioStream, FFprobeOutput } from "./ffprobe.js";
import { LOSSLESS_CODECS } from "./lossless-codecs.const.js";

export class FormatAttributeSource implements AttributeSource {
	readonly id = "format";
	private api!: AttributeSourceApiContext;

	enable(attributeSourceApiContext: AttributeSourceApiContext): void {
		this.api = attributeSourceApiContext;

		this.api.registerTrackAttributes([
			{
				key: "codec",
				type: "string",
				supportsMultiple: false,
				formatter: (codec) => {
					return codec.toUpperCase();
				},
			},
			{
				key: "bitrate",
				type: "integer",
				supportsMultiple: false,
				formatter: (bitrate) => {
					return `${Math.round(bitrate / 1000)} kbps`;
				},
			},
			{
				key: "samplerate",
				type: "integer",
				supportsMultiple: false,
				formatter: (samplerate) => {
					return `${samplerate / 1000} kHz`;
				},
			},
			{
				key: "quality_tier",
				type: "string",
				supportsMultiple: false,
				formatter: (qualityTier) => {
					switch (qualityTier) {
						case "highres":
							return "High Res";
						case "lossless":
							return "Lossless";
						default:
							return qualityTier;
					}
				},
			},
			{
				key: "channels",
				type: "integer",
				supportsMultiple: false,
			},
			{
				key: "channel_layout",
				type: "string",
				supportsMultiple: false,
				formatter: (layout) => {
					switch (layout) {
						case "stereo":
							return "Stereo";
						default:
							return layout;
					}
				},
			},
		]);
	}

	getName(): string {
		return "Audio Format";
	}

	async getTrackAttributeValues(
		helper: TrackAttributionHelper,
	): Promise<TrackMetadata> {
		const streamProducer = await helper.getAudioProducer("stream");
		if (!streamProducer) {
			return {
				artists: null,
				attributes: null,
			};
		}

		return new Promise<TrackMetadata>(async (resolve, reject) =>
			streamProducer
				.getStream()
				.then((stream) => {
					const child = spawn("ffprobe", [
						"-v",
						"error",
						"-show_format",
						"-show_streams",
						"-show_chapters",
						"-show_programs",
						"-show_private_data",
						"-of",
						"json",
						"-",
					]);

					let stdout = "";
					let stderr = "";

					child.stdout.on(
						"data",
						(chunk: Buffer) => (stdout += chunk.toString()),
					);
					child.stderr.on(
						"data",
						(chunk: Buffer) => (stderr += chunk.toString()),
					);

					stream.pipe(child.stdin);

					child.stdin.on("error", (e) => {
						if ("code" in e && e.code == "EPIPE") {
							return;
						}
						reject(e);
					});

					child.on("error", reject);

					child.on("close", (code) => {
						if (!stream.destroyed) {
							stream.unpipe(child.stdin);
							stream.destroy();
						}
						if (code) {
							return reject(
								new Error(
									`ffprobe exited with code ${code}. stderr: ${stderr}`,
								),
							);
						}

						try {
							const json: FFprobeOutput = JSON.parse(stdout);

							const attributes: AttributeValue[] = [];

							const streamInfo = json.streams?.find(
								(stream) => stream.codec_type == "audio",
							) as FFprobeAudioStream | undefined;
							if (streamInfo) {
								attributes.push({
									key: "codec",
									value: streamInfo.codec_name,
								});

								if (streamInfo.bit_rate) {
									const bitrate = parseInt(streamInfo.bit_rate);
									if (!isNaN(bitrate)) {
										attributes.push({
											key: "bitrate",
											value: bitrate,
										});
									}
								}

								let samplerate = 0;
								if (streamInfo.sample_rate) {
									const parsedSamplerate = parseInt(streamInfo.sample_rate);
									if (!isNaN(parsedSamplerate)) {
										samplerate = parsedSamplerate;
										attributes.push({
											key: "samplerate",
											value: parsedSamplerate,
										});
									}
								}

								if (streamInfo.channels) {
									attributes.push({
										key: "channels",
										value: streamInfo.channels,
									});
								}
								if (streamInfo.channel_layout) {
									attributes.push({
										key: "channel_layout",
										value: streamInfo.channel_layout,
									});
								}

								if (
									streamInfo.codec_name &&
									LOSSLESS_CODECS.includes(streamInfo.codec_name)
								) {
									if (
										samplerate > 48000 ||
										(streamInfo.bits_per_sample &&
											streamInfo.bits_per_sample > 16)
									) {
										attributes.push({
											key: "quality_tier",
											value: "highres",
										});
									} else {
										attributes.push({
											key: "quality_tier",
											value: "lossless",
										});
									}
								}
							}

							resolve({
								artists: null,
								attributes,
							});
						} catch (e) {
							reject(new Error("ffprobe didn't return valid JSON"));
						}
					});
				})
				.catch(reject),
		);
	}

	async getArtistAttributeValues(
		_helper: ArtistInformationHelper,
	): Promise<ArtistMetadata> {
		return {
			attributes: null,
		};
	}

	async getAlbumAttributeValues(
		_helper: AlbumInformationHelper,
	): Promise<AlbumMetadata> {
		return {
			attributes: null,
			artists: null,
		};
	}
}
