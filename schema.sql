create table if not exists modmail_bans
(
    id int auto_increment
        primary key,
    user_id varchar(36) not null,
    guild_id varchar(36) not null,
    banned_by varchar(36) null
);

create table if not exists modmail_mail
(
    mail_uuid varchar(36) not null
        primary key,
    thread_id varchar(36) not null,
    user_id varchar(36) not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null on update current_timestamp(),
    response_time int null,
    closed tinyint(1) default 0 not null,
    constraint modmail_mail_pk2
        unique (mail_uuid)
);

create table if not exists modmail_settings
(
    guild_id varchar(36) not null
        primary key,
    modmail_channel varchar(36) null
);

