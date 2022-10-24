--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    amount numeric NOT NULL,
    name text NOT NULL,
    date date,
    username text
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.accounts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    type text,
    username text,
    current_amount numeric,
    total_amount numeric
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    value text NOT NULL,
    username text NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tags ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    name text NOT NULL,
    date date NOT NULL,
    tags text[] NOT NULL,
    value numeric NOT NULL,
    username text NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.transactions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, amount, name, date, username) FROM stdin;
2	100	blah	2021-07-12	test
3	100	blah	2021-07-12	test
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, type, username, current_amount, total_amount) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, value, username) FROM stdin;
2	food	test
3	hello world	test
5	food	m
14	blah	m
4	blah	test
6	weed	m
7	gas	m
8	whiteclaw	m
9	alcohol	m
10	internet	m
11	rent	m
12	Car	m
13	Car Repair	m
1	test_1	test
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, name, date, tags, value, username) FROM stdin;
10	test_01	2022-05-20	{}	10.05	test
11	test_02	2022-05-20	{test_1,"hello world"}	9.23	test
13	test_04	2022-05-22	{}	22.17	test
14	test_blag	2022-06-03	{test_1,"hello world",NULL}	11.11	test
15	food_test	2022-06-03	{food}	2.02	test
16	testing	2022-06-03	{food,test_1}	3.42	test
17	testing123	2022-06-03	{food,test_1}	3.42	test
18	testing1234	2022-06-03	{food,test_1}	3.42	test
19	testing1234	2022-06-03	{food,test_1}	3.42	test
20	testing1234	2022-06-03	{food,test_1}	3.42	test
21	testing1234	2022-06-03	{food,test_1}	3.42	test
22	testing12345	2022-06-03	{food,test_1}	11.22	test
23	testing12345	2022-06-03	{food,test_1}	11.22	test
24	test99	2022-06-03	{food,test_1,blah}	77.77	test
25	hello world	2022-06-03	{food,test_1,"hello world",blah}	8.12	test
26	hello world	2022-06-03	{food,test_1,"hello world",blah}	8.12	test
27	hello world	2022-06-03	{food,test_1,"hello world",blah}	8.12	test
28	hello world	2022-06-03	{food,test_1,"hello world",blah}	8.12	test
29	hello world	2022-06-03	{food,test_1,"hello world",blah}	8.12	test
30	this is real	2022-06-03	{}	56.10	test
31	blah	2022-06-04	{food}	5.05	test
32	test_date	2022-06-02	{}	2.22	test
33	test blah	2022-06-07	{}	22.02	test
34	test blah 2	2022-06-07	{}	27.04	test
64	Rent for June	2022-06-01	{rent}	675	m
65	Hannaford	2022-06-01	{food}	30.87	m
66	Beach Boys	2022-06-01	{weed}	80	m
67	Digital Ocean	2022-06-02	{}	5	m
68	Gas	2022-06-03	{gas}	25.06	m
69	Hannaford	2022-06-04	{food}	22.07	m
70	White Claw	2022-06-04	{alcohol,whiteclaw}	18	m
71	Gas	2022-06-05	{gas}	25.04	m
72	Hannaford	2022-06-07	{food}	38.11	m
73	White Claw	2022-06-07	{alcohol,whiteclaw}	18	m
74	icloud	2022-06-07	{}	0.99	m
75	Spectrum	2022-06-09	{internet}	64.99	m
76	Beach Boys	2022-06-10	{weed}	33	m
77	Hannaford	2022-07-03	{food}	31.93	m
78	Brake Repair	2022-07-02	{Car,"Car Repair"}	533.92	m
79	Hannaford	2022-07-01	{food}	37.52	m
80	Rent	2022-07-01	{rent}	675	m
81	test	2022-10-21	{}	50	m
82	blah	2022-10-21	{blah}	17	m
83	testing123	2022-10-22	{}	11.12	m
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, username, password) FROM stdin;
1	test@test.com	test	test
4	test@test.com	blah	blah
5	test@test.com	m	test
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_id_seq', 3, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 14, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 83, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users unique_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

