export interface FFprobeOutput {
	format: FFprobeFormat;
	streams: FFprobeStream[];
	chapters: FFprobeChapter[];
	programs: unknown[];
}

export interface FFprobeFormat {
	filename: string;
	nb_streams: number;
	nb_programs: number;
	nb_stream_groups?: number;
	format_name: string;
	format_long_name: string;
	probe_score: number;

	start_time?: string;
	duration?: string;
	size?: string;
	bit_rate?: string;

	tags?: Record<string, string>;
}

export type FFprobeStream =
	| FFprobeAudioStream
	| FFprobeVideoStream
	| FFprobeGenericStream;

export interface FFprobeBaseStream {
	index: number;
	codec_name: string;
	codec_long_name: string;
	codec_type: "audio" | "video" | "subtitle" | "data" | string;
	codec_tag_string: string;
	codec_tag: string;
	r_frame_rate: string;
	avg_frame_rate: string;
	time_base: string;
	disposition: FFprobeDisposition;

	start_pts?: number;
	start_time?: string;
	duration_ts?: number;
	duration?: string;
	bit_rate?: string;

	tags?: Record<string, string>;
	side_data_list?: FFprobeSideData[];
}

export interface FFprobeAudioStream extends FFprobeBaseStream {
	codec_type: "audio";
	sample_rate: string;
	channels: number;

	sample_fmt?: string;
	channel_layout?: string;
	bits_per_sample?: number;
	initial_padding?: number;
}

export interface FFprobeVideoStream extends FFprobeBaseStream {
	codec_type: "video";
	width?: number;
	height?: number;
	pix_fmt?: string;
	sample_aspect_ratio?: string;
	display_aspect_ratio?: string;
}

export interface FFprobeGenericStream extends FFprobeBaseStream {
	codec_type: string;
}

export interface FFprobeDisposition {
	default: number;
	dub: number;
	original: number;
	comment: number;
	lyrics: number;
	karaoke: number;
	forced: number;
	hearing_impaired: number;
	visual_impaired: number;
	clean_effects: number;
	attached_pic: number;
	timed_thumbnails: number;
	non_diegetic?: number;
	captions?: number;
	descriptions?: number;
	metadata?: number;
	dependent?: number;
	still_image?: number;
	multilayer?: number;
}

export interface FFprobeChapter {
	id: number;
	time_base: string;
	start: number;
	start_time: string;
	end: number;
	end_time: string;
	tags?: Record<string, string>;
}

export interface FFprobeSideData {
	side_data_type: string;
	[key: string]: unknown;
}
