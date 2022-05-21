-- commands

-- use a database in PSQL
-- \c (database_name)

-----------------------
-- create users table
-----------------------

-- Table: public.users
-- DROP TABLE public.users;

CREATE TABLE public.users
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    email text COLLATE pg_catalog."default" NOT NULL,
    username text COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT unique_username UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE public.users
    OWNER to postgres;





-----------------------
-- create transactions table
-----------------------

-- Table: public.transactions
-- DROP TABLE public.transactions;

CREATE TABLE public.transactions
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name text COLLATE pg_catalog."default" NOT NULL,
    date date,
    amount numeric,
    type text COLLATE pg_catalog."default",
    note text COLLATE pg_catalog."default",
    category text COLLATE pg_catalog."default",
    username text COLLATE pg_catalog."default",
    account text COLLATE pg_catalog."default",
    CONSTRAINT transactions_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.transactions
    OWNER to postgres;




-----------------------
-- create categories table
-----------------------

-- Table: public.categories
-- DROP TABLE public.categories;

CREATE TABLE public.categories
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name text COLLATE pg_catalog."default" NOT NULL,
    type text COLLATE pg_catalog."default",
    username text COLLATE pg_catalog."default",
    current_amount numeric,
    total_amount numeric,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.categories
    OWNER to postgres;



-----------------------
-- create categories table
-----------------------

-- Table: public.accounts
-- DROP TABLE public.accounts;

CREATE TABLE public.accounts
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    amount numeric NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    date date,
    username text COLLATE pg_catalog."default",
    CONSTRAINT accounts_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.accounts
    OWNER to postgres;