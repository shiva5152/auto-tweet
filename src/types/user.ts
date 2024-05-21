
export type TUser = {
    _id: string,
    name: string;
    tweeterId: string;
    avatar: string;
    accessToken: string;
    refreshToken: string;
    createdAt?: Date;
    updatedAt?: Date;
}