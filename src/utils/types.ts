export type Metadata = {};

export type IconikPostPayload = {
  segment_color: string;
  segment_type: string;
  segment_text: string;
  time_start_milliseconds: number;
  time_end_milliseconds: number;
  metadata: Metadata;
  has_drawing: boolean;
  drawing: null;
};

export type Comment = {
  like_count: number;
  read_count: number;
  target_asset_id: null;
  text: string;
  private: boolean;
  device_channel_input_id: null;
  page: null;
  parent_id: null;
  _type: string;
  completer_id: null;
  owner_id: string;
  review_link_id: null;
  inserted_at: Date;
  completed_at: null;
  id: string;
  duration: null;
  timestamp_microseconds: null;
  yaw: null;
  annotation: null;
  owner: Owner;
  frame: null;
  updated_at: Date;
  deleted_at: null;
  timestamp: null;
  thumb: string;
  comment_entities: any[];
  asset_id: string;
  pitch: null;
  anonymous_user_id: null;
  completed: boolean;
  aspect_ratio: number;
  has_replies: boolean;
  fov: number;
  text_edited_at: null;
};

export type Owner = {
  avatar_color: string;
  features_seen: null;
  last_seen: null;
  _type: string;
  from_adobe: boolean;
  inserted_at: Date;
  timezone_value: string;
  profile_image: string;
  image_128: null;
  id: string;
  highest_account_role: null;
  name: string;
  from_google: boolean;
  bio: null;
  phone: null;
  image_256: null;
  image_32: null;
  updated_at: Date;
  deleted_at: null;
  user_default_color: string;
  email_confirm_by: null;
  joined_via: string;
  digest_frequency: string;
  mfa_enforced_at: null;
  image_64: null;
  email: string;
  profile_image_original: null;
  first_login_at: Date;
  location: null;
  roles: null;
  next_digest_date: Date;
  upload_url: string;
  email_preferences: null;
  integrations: null;
  context: null;
  account_id: null;
};

export type IconikSegment = {
  asset_id: string;
  date_created: Date;
  date_modified: Date;
  drawing: null;
  external_id: null;
  face_bounding_boxes: null;
  has_drawing: boolean;
  id: string;
  keyframe_id: null;
  metadata_view_id: null;
  parent_id: null;
  path: string;
  person_id: null;
  segment_checked: null;
  segment_color: null;
  segment_text: string;
  segment_track: null;
  segment_type: string;
  share_user_email: null;
  status: string;
  subclip_id: null;
  time_end_milliseconds: number;
  time_start_milliseconds: number;
  top_level: boolean;
  transcription: null;
  transcription_id: null;
  user_id: string;
  version_id: string;
};
