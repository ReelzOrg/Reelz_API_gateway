// All properties are defined as value optional which forces you to add a value to the property (even if undefined)
// If you make a property key optional (by adding a ?), then you can omit adding the key entirely
export interface User {
	_id: string | undefined;
	username: string | undefined;
	email: string | undefined;
	first_name: string | undefined;
	last_name: string | undefined;
	follower_count: number | undefined;
	following_count: number | undefined;
	post_count: number | undefined;
	profile_picture: string | undefined;
	is_private: boolean | undefined;
	dob: string | undefined;
	gender: string | undefined;
	phone: string | undefined;
	bio: string | undefined;
	subscription_level: string | undefined;
	password_hash?: string | undefined;
	created_at?: string | undefined;
	updated_at?: string | undefined;
}

export enum LiveStreamRole {
	BROADCASTER = "broadcaster",
	VIEWER = "viewer"
}