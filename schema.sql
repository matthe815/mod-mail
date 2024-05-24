create table modmail_mail
(
    mail_uuid     varchar(36)                            not null
        primary key,
    thread_id     varchar(36)                            not null,
    user_id       varchar(36)                            not null,
    created_at    timestamp  default current_timestamp not null,
    updated_at    timestamp  default current_timestamp not null on update current_timestamp(),
    response_time int                                    null,
    closed        bool default 0                   not null,
    constraint modmail_mail_pk2
        unique (mail_uuid)
);

