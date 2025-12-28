--
-- PostgreSQL database dump
--

\restrict 9s6TgSEZGlUZTkfGdPERNtSfwpIR8X3aKDkZoGEShgXER5BYu3aZwvq7BSBf1u9

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg12+1)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE drizzle.__drizzle_migrations DISABLE TRIGGER ALL;

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	c62d2e265d987d1e4f0beebfef6d46d89892c26acf9a21ef21361baa7d14d56a	1760501267086
3	4956b887dc9e3575869668940763d0a5dda29328c7c80cbad3da0734895661c6	1760501267087
4	b9be6b7bdcb79b326af30628be1c6079b9a99225786f3bea0ab3680657298189	1760501267088
\.


ALTER TABLE drizzle.__drizzle_migrations ENABLE TRIGGER ALL;

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.categories DISABLE TRIGGER ALL;

COPY public.categories (id, name, slug, description, icon, color, display_order, created_at, updated_at) FROM stdin;
fedff552-1029-4671-a224-5b0ba67981c8	Muffler Men	muffler-men	Giant fiberglass figures that once adorned muffler shops and gas stations	🗿	#ef4444	1	2025-10-17 18:02:54	2025-10-17 18:02:54
3a3a1b02-a0e5-4431-b41b-0013567f20c8	World's Largest	worlds-largest	Colossal monuments to American roadside excess	🎪	#3b82f6	2	2025-10-17 18:02:54	2025-10-17 18:02:54
7ca76041-0d98-4381-8a50-41555e02629c	Unique Finds	unique-finds	Peculiar treasures and oddities that defy categorization		#8b5cf6	3	2025-10-17 18:02:54	2025-10-17T20:36:50.981Z
c35d12f1-6a64-459b-b8dd-9ff787122615	Peter Toth	peter-toth		🗿	#f97316	4	2025-10-20 21:13:28	2025-10-21T15:29:30.804Z
\.


ALTER TABLE public.categories ENABLE TRIGGER ALL;

--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.locations DISABLE TRIGGER ALL;

COPY public.locations (id, name, latitude, longitude, category, state, city, zip_code, photo_url, photo_id, tagged_date, custom_fields, description) FROM stdin;
67b7caee-dd2a-4ae7-bbff-b2ad30f75c83	World's Largest Turkey	0	0	worlds-largest	Minnesota	Frazee		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/6a534f20c3e07f0af60e002a216f7d3699fcb6e3ce8dc86a62bd2df66c09ef54-1762285259445-largest-turkey.jpg		0020-06-20	{}	
5f69e413-1d6f-433e-9593-c0d88335fc3d	Cadillac Ranch	35.1872	-101.9871	unique-finds	Texas	Amarillo	79124	https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800	fb_013	2023-10-22	{"type":"art installation","cars":"10 Cadillacs"}	
7a868b41-0345-4211-a7fe-43d3c46bab8c	Glossy Soldier	39.6841305	-110.854605	muffler-men	Utah	Helper		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/e7737dfd0e3be56c48c56915e6cdddc8a01786ec18543b74d1ce64d4b32393ef-1761857264775-army-mufflerMan.jpg	auto_7a868b41	2024-06-13	{}	
53bf0358-0aae-4083-9232-502b27350641	Cody Trading Post Indian	0	0	muffler-men	Nebraska	221North Platte	69101	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/fa1297117289f221d69226bd840dc2766c22a483751c5ae183c928ae98922250-1761857171174-CodyTradingPost-Indian.jpg	auto_53bf0358	2025-10-22	{"Type":"Indian"}	
64883f74-4d6e-43a1-bb3c-1bd4457331b2	Mini Golf Jeb	0	0	muffler-men	Oklahoma	Hochatown	 74728	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/a2903a2cda0a22c23096de3872d09f303551be7120cd9f6a9ddf7f77e409a75e-1761857173813-Jeb-oklahoma.jpg	auto_64883f74	2023-04-04	{"Holding":"Golf Club"}	
3259d93d-dd01-4e45-ba58-3e597c9f5965	Mini	37.3123905	-79.5399003	muffler-men	Virginia	Bedford		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/1a6ce1b02901efe3a7da0fd307d0789ced243fbff4ede258574d19c43b06e4e4-1762287155169-IMG_5561.png	auto_3259d93d	2018-09-26	{}	
88878d03-22fc-4ea7-aff6-57e85e2ff2c4	Copperhead mufflerMan	38.8339578	-104.825348	muffler-men	Colorado	colorado Springs		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/1947ed44f97b2e39cc48e27a12de2250a1976d13a40109f8b7278420afad160c-1761857283689-copperhead-mufflerMan.jpg	auto_88878d03	2024-06-14	{"Type":"Cowboy","holding":"Guitar"}	
ee4edb5a-d51a-4f21-8ea5-51c4fd24bad1	World's Largest Catsup Bottle	38.627	-90.1994	worlds-largest	Illinois	Collinsville	62234	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/c6abc9a1a0a97d4a539eb0d5d37acb424baac9c99e4cebb2f5f3056200ed9938-1761857339011-catsup-bottle.jpg	fb_008	2024-10-05	{"height":"170 feet"}	
a5889664-c6b9-4d53-bc36-987342fd3edb	Coal Miner Muffler Man	39.3953654	-80.3008402	muffler-men	West Virginia	Shinnston		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/02bba9a0a42819bb736db194321da2141a79d5d47e4f9b7df08a9be1ae600830-1761857310541-coal-miner.jpg	fb_003	2021-10-14	{"Holding":"Lunch Pail"}	
0d67598d-9a51-4973-8fa4-4b6c9750e468	World's Largest Peanut	33.4754	-84.4491	worlds-largest	Georgia	Ashburn	31714	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/b2df70de651211987f09d635335ac1cf32aa0ce0a67970047f5d4ee0c419b0ab-1761857342066-largest-peanut.jpg	fb_011	2023-12-08	{"type":"monument","material":"concrete"}	
adbfadbb-b790-4d36-99a4-a195cc196751	Gemini Giant Muffler Man	41.152	-88.1792	muffler-men	Illinois	Wilmington	60481	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/af0c91c158543f9d9c807e4d0b12d0b46907016be4b4d8f147f3269cf2550a09-1761857188588-gemini-giant.jpg	fb_009	2018-02-14	{"theme":"space","holding":"rocket"}	
20dc3f0d-34d6-4e61-bf66-7db7d7ad89f9	Worls's Largest Fountain Drink	37.304731	-89.5176418	worlds-largest	Missouri	Cape Girardeau		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/efb70c0565156edc20124a15ac009d5c12d6a64fd568fce5f1861dfbb2950344-1761857313098-fountain-drink.jpg	auto_20dc3f0d	2021-04-03	{}	
40927521-63d5-464a-ac50-99e7efe2c7df	Iowa Muffler Man	43.2694242	-91.4757884	muffler-men	Iowa	 Waukon		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/ad4257b71f4ca1410eb39dd5c4eb1b758047c20baccaeca6eff5fe5b4b82cbcf-1761857309424-iowa-mufflerMan.jpg	auto_40927521	2025-10-15	{}	
6521ebde-7d64-4d8c-b5e8-53b41e6825cd	thirsty Muffler Man	43.9943	-117.2758	muffler-men	North Dakota	Vale		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/deafae2a96a3da7921ffd4c72d56480d451673ba4794f28cef996a73592c4693-1761857316790-thirstyMan.jpg	auto_6521ebde	2024-10-16	{}	
4085434b-7f90-49d2-b899-151793801849	World's Largest Buffalo	46.910544	-98.708436	worlds-largest	North Dakota	Jamestown		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/dac7310a177040cff7916713806fd00b50b2b37fe3a6ed00e3def10f289065b6-1761857329694-Buffalo.jpg	auto_4085434b	2024-06-20	{}	
ec935c53-edc3-43d4-965b-ccd2d72f06f1	Paul Bunyan Muffler Man	44.8521	-93.2421	muffler-men	Minnesota	St. Paul	55101	https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800	fb_005	2024-09-03	{"companion":"Babe the Blue Ox","era":"1950s"}	
1892403e-c9a2-4cfe-9924-cfe1efd533d6	Uniroyal Gal Muffler Woman	33.4484	-112.074	muffler-men	Arizona	Phoenix	85003	https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800	fb_007	2024-03-18	{"gender":"female","brand":"Uniroyal"}	
fffcc8b2-4a32-44cb-a25e-e68d30e72e68	World's Largest Rocking Chair	38.8183	-90.6906	worlds-largest	Illinois	Casey	63640	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/aa83b1378cd0f065e75fc58adca65a9b6151c812f784744c18cb98a00ae40b46-1761857170254-worlsLargestRocker.jpg	fb_006	2020-02-19	{}	
76988393-a7d9-47b3-8c7b-b41eb6e39efa	Indian Chief	36.7104018	-81.975249	muffler-men	Virginia	 Abingdon		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/a78f92e992b7647b89662762b03f010b218f61c62c64c17efffdb998df855182-1761857336010-indian-cheif.jpg	auto_76988393	2024-06-16	{}	
e9e4854a-92c0-4c69-af57-b210e959b69e	Trading Post Indian	34.9550817	-97.2684063	muffler-men	Oklahoma		73014	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/8581928db692762b3484056313763185b85d4889b2f3ed4806089f90b1ce0b96-1761857294648-oklahoma-indian.jpg	auto_e9e4854a	2022-06-01	{"type":"Indian"}	
59c9688c-2537-473c-b8e8-a54b4ce8eed7	The world's largest fire hydrant	0	0	worlds-largest	South Carolina	Columbia		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/178b3108326b1fbca989b5434a883f108bd3938347bac7a7768cd39e41dcec3b-1761857166938-wlFireHydrant.jpg	auto_59c9688c	2018-07-03	{}	
94ce8dfa-7f38-4525-b92f-3b391612f5a7	World's Largest Mailbox	41.2565	-95.9345	worlds-largest	Nebraska	Casey	50048	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/d4a534b94488976b7a2ff24062681f723a732d55529904ae98ec7c2579a9002d-1761859058579-IMG_0640.png	fb_010	2024-01-22	{"functional":"yes","color":"blue"}	
15b4923f-c469-4317-85ec-0dc0b7ce4953	Big Don	42.7325	-112.0971	muffler-men	Indiana	· Pocatello		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/15303aeeccccefe069536b80d4447658f353ad5e7270b7a46c3c92b581cb9dfa-1761857320848-bigDon.jpg	auto_15b4923f	2024-06-13	{}	
72cf39b5-2a06-430d-933b-7b0407af636f	World's Largest Thermometer	35.5944	-116.0733	worlds-largest	California	Baker	92309	https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800	fb_004	2024-05-12	{"height":"134 feet","location":"Baker"}	
5a46e6a9-1c5c-4b8d-b965-9f2256c0ffa2	World's Largest Tire	39.2026	-98.4842	worlds-largest	Michigan	Allen Park		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/53574c3e5458c4168321862ef5a67bcab24f96b898f14fef18260609eaf90050-1761857315353-largest-tire.jpg	fb_002	2020-02-04	{"Brand":"Uniroyal"}	
e8ccdd14-ac88-45ed-88f0-dedb43920386	Toth Indian	34.0522	-118.2437	peter-toth	Utah	Murray	84107	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/5a57f0039600e062e72004b4f069a1d63a8d92ac9461000913610dd9dd355dbc-1761857255679-murray-toth.jpg	fb_012	2023-11-17	{"Designer":"Peter Toth"}	
a1bd7487-6a18-4f71-a1a9-14b22d9a4be4	World's Largest Fork	37.2081729	-93.2922715	worlds-largest	Missouri	Springfield		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/535b9ba6c20993b750c4071bc2220e2d711012c1acff3985755ecbd23857d3c8-1761857314373-Largest-Fork.jpg	auto_a1bd7487	2021-03-30	{"Utensil":"Fork"}	
1f3f849d-b145-4288-ab29-4952860fd599	World's Largest Hex Nut	44.5126379	-88.0125794	worlds-largest	Wisconsin	Green Bay		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/dae7f8a28d83654bcb0431465f211107d29f160abb10c0df166cba32bfa3052c-1761857323603-hexNut.jpg	auto_1f3f849d	2024-06-18	{"origin":"Hardware"}	
d7e0ecc2-25db-4395-a7ec-e6e087ca4604	Red Lodge Indian	45.1859038	-109.2470622	peter-toth	Montana	Red Lodge		https://via.placeholder.com/300x200?text=Red%20Lodge%20Indian	auto_d7e0ecc2	2025-10-20	{"Designer":"Peter Toth"}	
f86dd882-02a8-4ac1-89d4-ad14bff078b9	Cowboy	40.8164531	-79.5219893	muffler-men	Pennsylvania	Kittanning		https://via.placeholder.com/300x200?text=Cowboy	auto_f86dd882	17-04-24	{}	
ebe9cee4-2a65-4cc4-95cf-6cbee4b66e54	Indian	36.5486597	-86.6961102	muffler-men	Tennessee	Cross Plains		https://via.placeholder.com/300x200?text=Indian	auto_ebe9cee4	2018-02-25	{}	
639f50c1-8244-4bab-abb4-eff59f7ad0f6	Cowboy	36.3883031	-86.4475898	muffler-men	Tennessee	Gallatin		https://via.placeholder.com/300x200?text=Cowboy	auto_639f50c1	2018-07-11	{}	
eb63b0e3-013b-4b93-bb9c-3cc7c7659c3a	Cowboy	36.550238	-82.5594293	muffler-men	Tennessee	Kingsport		https://via.placeholder.com/300x200?text=Cowboy	auto_eb63b0e3	2018-07-21	{}	
4d03cbc6-44d4-4de6-814e-bd327fefd10d	Big John	34.9917606	-90.1275934	muffler-men	Mississippi	Southhaven		https://via.placeholder.com/300x200?text=Big%20John	auto_4d03cbc6	18-08-15	{}	
10575923-105e-49a4-a44f-55b86ce65fa6	Bunyan	35.3940059	-82.3409496	muffler-men	North Carolina	Edneyville		https://via.placeholder.com/300x200?text=Bunyan	auto_10575923	2018-09-14	{}	
5a7cac9c-0251-458a-80ea-8d9a82e534de	Bunyan	37.270973	-79.9414313	muffler-men	Virginia	Roanoke		https://via.placeholder.com/300x200?text=Bunyan	auto_5a7cac9c	2018-09-26	{}	
3b9a150a-02fc-4d65-8f88-62e65dbe0d8c	Bunyan	36.9439917	-82.4640401	muffler-men	Virginia	Coeburn		https://via.placeholder.com/300x200?text=Bunyan	auto_3b9a150a	2018-10-12	{}	
57b90811-b39d-44db-9e15-86d1f3a17bf9	Indian	35.1184149	-84.0886181	muffler-men	North Carolina	Cherokee		https://via.placeholder.com/300x200?text=Indian	auto_57b90811	2018-10-27	{}	
48cc344b-247e-498f-92e3-d496f3ac11f0	Bunyan	33.9237141	-84.8407732	muffler-men	Georgia	Dallas		https://via.placeholder.com/300x200?text=Bunyan	auto_48cc344b	2018-11-21	{}	
76ad89c1-b70d-4b75-b8ef-6d8a0acb7abd	Bunyan	33.6795531	-84.4393724	muffler-men	Georgia	East Point		https://via.placeholder.com/300x200?text=Bunyan	auto_76ad89c1	2018-11-22	{}	
2fe0ca14-1917-4617-9d06-f7d15b148880	Halfwit	0	0	muffler-men	Georgia	Dallas	 30132	https://via.placeholder.com/300x200?text=Halfwit	auto_2fe0ca14	2020-08-05	{}	
e93eee03-c333-4e50-9a37-ae30efc61f3b	Mister Bendo	43.5476008	-96.7293629	muffler-men	South Dakota	Sioux Falls		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/5f66f73901b42e8eb63bc910713e85a5e083510244c70843b6144be8746999d5-1761857234463-MrBendo-Sioux.jpg	auto_e93eee03	2025-10-20	{"Holding":"Crobar"}	
5b4438c3-8e2f-43e3-b95f-e98fe68ac330	Uniroyal Gal	43.190039	-112.348357	muffler-men	Idaho	Blackfoot		https://joe-app.onrender.com/uploads/1761595822087-554238929.jpg	auto_5b4438c3	2025-10-20	{}	
9b463f12-7270-4a86-a75c-248984de3745	Two Harbors  Indian	47.0257139	-91.6730523	peter-toth	Minnesota	Two Harbors		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/ce73bb95b8b722c267e31571661c44fc230af02b3a70c700e253207ebcb3f306-1761859712840-twoHarbors-Toth.jpg	auto_9b463f12	2024-10-20	{}	
614ffc39-c240-4174-abef-76da35367b16	Tourist Indian	43.4887907	-112.03628	peter-toth	Idaho	Idaho Falls	83401	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/cdbed2816a749532aeea97948d00a7a7326b5a76566e8d3bcd433ba283f21fa8-1761857239746-Toth-touristPark.jpg	auto_614ffc39	2025-10-20	{"Designer":"Peter Toth"}	
81bb2d93-fab6-4358-82e9-3d5834d0686a	Cowtown Cowboy	0	0	muffler-men	New Jersey	Woodstown		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/308b1748b301e0bd9fade81c4ab5e0e00f79ed08ce38d1bf348fe70168bbfd24-1761857183838-cowtown-cowboy.jpg	auto_81bb2d93	2025-10-22	{"Type":"Cowboy","accessories":"pistol, holster"}	
9cee4caf-1588-45d9-a10f-5488b9cedc5f	Mt. Vernon Uniroyal Gal	0	0	muffler-men	Illinois	Vernon		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/f615251faf330b69d3da210dab4a8a41e83fda7f11a0b79fdfd502bcc566b529-1761857101947-vernon-Gal.jpg	auto_9cee4caf	2025-10-22	{}	
af4620f2-478d-42b1-bdc0-0a05ccb0fca1	Fargo  Muffler Man	46.877229	-96.789821	muffler-men	North Dakota	Fargo		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/2876da0e509dfb8e23a4dbe7a665c9ad3f28ef6d726b2928638f231ab1750ce1-1761857220151-mufflerMan-Fargo.jpg	auto_af4620f2	2025-10-20	{}	
6bc2430e-93e6-4a37-a08e-cf80dd69cc11	orld's Largest Butter Knife	0	0	worlds-largest	Kentucky	Franklin		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/7aadb4c4024941d069289f68571d225cb3f3be296a7d90f1ad1426f11e6a024a-1761857168045-largesKnife.jpg	auto_6bc2430e	2022-01-21	{"Height":"24 feet"}	
9c6927a8-93c6-4afd-b33f-5bff0d3f91ff	Big John	42.3531014	-88.0931683	muffler-men	Illinois	El Dorado	62930	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/987fdbc637c27c1e3a287ca033c4439648e51af9f30bbbe353969623dffdff03-1761857184884-bigJohn-elDorado.jpg	auto_9c6927a8	2017-09-19	{"holding":"grocery bags"}	
35f3c51f-098d-4730-96f4-6b132cfea3c3	 La Salsa Muffler Man	0	0	muffler-men	Kansas	Dodge City		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/b0fe563a66fe49a850842a49a48db51f64facf3ebbfa54cf6c404dcd8d124940-1761857164780-laSalsa.jpg	auto_35f3c51f	2025-10-22	{}	
fca4dfe8-9768-48d0-9121-53735d8c9557	World's Largest Pelican	0	0	worlds-largest	Minnesota	Pelican Rapids		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/76476cee9d39b888082123659cb72c05a040cc3ee0b70befef4c99ca146e9cc3-1761856980669-largestPelican.jpg	auto_fca4dfe8	2024-06-20	{}	
6978ed57-a3c7-4f02-be98-860ec13dbb2e	Vintage Greaser	38.0608444	-97.9297743	muffler-men	Kansas	Hutchinson, 		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/a200d6b46cfeae161704a53f2cf45c18110ecd5c622a2d7fcf4ac161820daa63-1761857185967-greaser.jpg	auto_6978ed57	2025-10-21	{}	
3577603b-d50e-4a3b-9c7a-3a9ab619bc93	Wilsons RV and Park	42.7757368	-114.7042168	muffler-men	Idaho	Wendell		https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/2fbdb2e368dc0704b04b327f92642ea215176b6b594a71c4ab2931be47dcbb2f-1761857247040-wilsons-mufflerMan.jpg	auto_3577603b	2025-10-20	{"Holding":"Hot Dog"}	
\.


ALTER TABLE public.locations ENABLE TRIGGER ALL;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.users DISABLE TRIGGER ALL;

COPY public.users (id, username, password) FROM stdin;
2de0f7b7-be75-42a6-a6fb-1a55b43a7220	admin	$2b$10$ZIw3HKRpJN5ri5mVMk/7.eikLYZ2/XbrcWoVrrP5I5pIVy7O0P4V2
\.


ALTER TABLE public.users ENABLE TRIGGER ALL;

--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.media DISABLE TRIGGER ALL;

COPY public.media (id, filename, original_name, url, mime_type, size, width, height, alt, caption, uploaded_at, uploaded_by, data, storage_path) FROM stdin;
46394d69-33a4-43f7-98d9-e4b08ad5b03b	largestPelican.jpg	largestPelican.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/76476cee9d39b888082123659cb72c05a040cc3ee0b70befef4c99ca146e9cc3-1761856980669-largestPelican.jpg	image/jpeg	309324	\N	\N			2025-10-30 20:43:05.571078+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/76476cee9d39b888082123659cb72c05a040cc3ee0b70befef4c99ca146e9cc3-1761856980669-largestPelican.jpg
ca5776e7-d9c8-47dc-b527-185ad792f323	gallatin-Tn.jpg	gallatin-Tn.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/12419c80de0eb884c530a033c67020d0951fd0dbfc81cba9e0c75b8e5d06334d-1761857086788-gallatin-Tn.jpg	image/jpeg	224648	\N	\N			2025-10-30 20:44:57.218063+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/12419c80de0eb884c530a033c67020d0951fd0dbfc81cba9e0c75b8e5d06334d-1761857086788-gallatin-Tn.jpg
8ea3ab71-8d4d-4266-bf4e-25e96109e19f	large.png	large.png	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/7841a00f3e36265aef5987e5312b65e9abd71ed02243f0f21c3ee5e757ca3d03-1761857097786-large.png	image/png	9303	\N	\N			2025-10-30 20:44:59.481911+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/7841a00f3e36265aef5987e5312b65e9abd71ed02243f0f21c3ee5e757ca3d03-1761857097786-large.png
fbfe8419-1ea4-4083-8ad1-546db7767f25	west-branch.jpg	west-branch.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/a4b005eaf8db40b35bcbd317b60937dae379e3fdde6e80cada249364b1c5f8ff-1761857099649-west-branch.jpg	image/jpeg	55083	\N	\N			2025-10-30 20:45:01.487535+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/a4b005eaf8db40b35bcbd317b60937dae379e3fdde6e80cada249364b1c5f8ff-1761857099649-west-branch.jpg
90461fb1-0b35-4e0d-a36d-7d07b8ac2677	vernon-Gal.jpg	vernon-Gal.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/f615251faf330b69d3da210dab4a8a41e83fda7f11a0b79fdfd502bcc566b529-1761857101947-vernon-Gal.jpg	image/jpeg	273104	\N	\N			2025-10-30 20:45:13.917386+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/f615251faf330b69d3da210dab4a8a41e83fda7f11a0b79fdfd502bcc566b529-1761857101947-vernon-Gal.jpg
743d1f16-19fc-4d85-9656-4df3b22d0b38	Delaware-Toth.jpg	Delaware-Toth.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/9e239e5157668b1d6589e6f1bac21e09c47b9ef836dac97219db7d0fb4543d8f-1761857114117-Delaware-Toth.jpg	image/jpeg	231178	\N	\N			2025-10-30 20:45:42.490165+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/9e239e5157668b1d6589e6f1bac21e09c47b9ef836dac97219db7d0fb4543d8f-1761857114117-Delaware-Toth.jpg
d953ec55-bc27-4ab4-9e36-d874623f438f	largestPelican.jpg	largestPelican.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/76476cee9d39b888082123659cb72c05a040cc3ee0b70befef4c99ca146e9cc3-1761857142737-largestPelican.jpg	image/jpeg	309324	\N	\N			2025-10-30 20:46:02.936294+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/76476cee9d39b888082123659cb72c05a040cc3ee0b70befef4c99ca146e9cc3-1761857142737-largestPelican.jpg
159e9084-b804-4cc1-8bbe-b5e9575cd32b	laSalsa.jpg	laSalsa.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/b0fe563a66fe49a850842a49a48db51f64facf3ebbfa54cf6c404dcd8d124940-1761857164780-laSalsa.jpg	image/jpeg	247458	\N	\N			2025-10-30 20:46:06.27005+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/b0fe563a66fe49a850842a49a48db51f64facf3ebbfa54cf6c404dcd8d124940-1761857164780-laSalsa.jpg
aefa82bd-1104-45fe-adf4-ceb5d0c61981	Halfwit.jpg	Halfwit.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/b9ae11d907277c51f9adeb48896ba170b4e163cda50f3c21d2b2e930fdfab676-1761857166365-Halfwit.jpg	image/jpeg	80492	\N	\N			2025-10-30 20:46:06.845475+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/b9ae11d907277c51f9adeb48896ba170b4e163cda50f3c21d2b2e930fdfab676-1761857166365-Halfwit.jpg
0ef5c263-2944-42f0-8319-14e6e1b608a7	wlFireHydrant.jpg	wlFireHydrant.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/178b3108326b1fbca989b5434a883f108bd3938347bac7a7768cd39e41dcec3b-1761857166938-wlFireHydrant.jpg	image/jpeg	194739	\N	\N			2025-10-30 20:46:07.948423+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/178b3108326b1fbca989b5434a883f108bd3938347bac7a7768cd39e41dcec3b-1761857166938-wlFireHydrant.jpg
75846f6f-fa22-4eba-b27d-5cfd95718f24	largesKnife.jpg	largesKnife.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/7aadb4c4024941d069289f68571d225cb3f3be296a7d90f1ad1426f11e6a024a-1761857168045-largesKnife.jpg	image/jpeg	396113	\N	\N			2025-10-30 20:46:10.157941+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/7aadb4c4024941d069289f68571d225cb3f3be296a7d90f1ad1426f11e6a024a-1761857168045-largesKnife.jpg
e0ea20d9-f9d3-4ea0-adf2-3241045866da	worlsLargestRocker.jpg	worlsLargestRocker.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/aa83b1378cd0f065e75fc58adca65a9b6151c812f784744c18cb98a00ae40b46-1761857170254-worlsLargestRocker.jpg	image/jpeg	47967	\N	\N			2025-10-30 20:46:10.985479+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/aa83b1378cd0f065e75fc58adca65a9b6151c812f784744c18cb98a00ae40b46-1761857170254-worlsLargestRocker.jpg
28fc5d32-9b9a-46cf-a8b5-6b04ca8be85c	CodyTradingPost-Indian.jpg	CodyTradingPost-Indian.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/fa1297117289f221d69226bd840dc2766c22a483751c5ae183c928ae98922250-1761857171174-CodyTradingPost-Indian.jpg	image/jpeg	335143	\N	\N			2025-10-30 20:46:13.553479+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/fa1297117289f221d69226bd840dc2766c22a483751c5ae183c928ae98922250-1761857171174-CodyTradingPost-Indian.jpg
af273369-08f4-4fbf-a638-bcb89cbc0272	Jeb-oklahoma.jpg	Jeb-oklahoma.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/a2903a2cda0a22c23096de3872d09f303551be7120cd9f6a9ddf7f77e409a75e-1761857173813-Jeb-oklahoma.jpg	image/jpeg	422108	\N	\N			2025-10-30 20:46:17.438184+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/a2903a2cda0a22c23096de3872d09f303551be7120cd9f6a9ddf7f77e409a75e-1761857173813-Jeb-oklahoma.jpg
3165ce66-33e2-4c66-a708-21664ba9bc52	cowtown-cowboy.jpg	cowtown-cowboy.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/308b1748b301e0bd9fade81c4ab5e0e00f79ed08ce38d1bf348fe70168bbfd24-1761857183838-cowtown-cowboy.jpg	image/jpeg	31808	\N	\N			2025-10-30 20:46:24.709381+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/308b1748b301e0bd9fade81c4ab5e0e00f79ed08ce38d1bf348fe70168bbfd24-1761857183838-cowtown-cowboy.jpg
2262d6d7-2bc8-4608-8ae9-76df376815ee	bigJohn-elDorado.jpg	bigJohn-elDorado.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/987fdbc637c27c1e3a287ca033c4439648e51af9f30bbbe353969623dffdff03-1761857184884-bigJohn-elDorado.jpg	image/jpeg	47703	\N	\N			2025-10-30 20:46:25.82938+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/987fdbc637c27c1e3a287ca033c4439648e51af9f30bbbe353969623dffdff03-1761857184884-bigJohn-elDorado.jpg
7c8bf018-175f-4caa-a6ad-367a9c736ab7	greaser.jpg	greaser.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/a200d6b46cfeae161704a53f2cf45c18110ecd5c622a2d7fcf4ac161820daa63-1761857185967-greaser.jpg	image/jpeg	176982	\N	\N			2025-10-30 20:46:28.47357+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/a200d6b46cfeae161704a53f2cf45c18110ecd5c622a2d7fcf4ac161820daa63-1761857185967-greaser.jpg
f189a9aa-d601-4f75-8f0e-b811ce8eda0c	mufflerMan-Fargo.jpg	mufflerMan-Fargo.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/2876da0e509dfb8e23a4dbe7a665c9ad3f28ef6d726b2928638f231ab1750ce1-1761857220151-mufflerMan-Fargo.jpg	image/jpeg	308722	\N	\N			2025-10-30 20:47:14.366644+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/2876da0e509dfb8e23a4dbe7a665c9ad3f28ef6d726b2928638f231ab1750ce1-1761857220151-mufflerMan-Fargo.jpg
8130ca11-13f8-4c45-9688-a0844295f152	montana-Toth.jpg	montana-Toth.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/5f749227e5600f00f8a84d50f0e89e2b248cc98237dd4f03c6c5a00221024573-1761857236699-montana-Toth.jpg	image/jpeg	319518	\N	\N			2025-10-30 20:47:19.585988+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/5f749227e5600f00f8a84d50f0e89e2b248cc98237dd4f03c6c5a00221024573-1761857236699-montana-Toth.jpg
474f04ab-fb0d-4c26-abb0-22b7ad748aa7	UniroyalGal-Blackfoot.jpg	UniroyalGal-Blackfoot.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/1e3bfca50b92b6dc7ac014b6ce8f9fa4ae112eeba6073804306bb1c13cc71e0d-1761857242739-UniroyalGal-Blackfoot.jpg	image/jpeg	205925	\N	\N			2025-10-30 20:47:24.389336+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/1e3bfca50b92b6dc7ac014b6ce8f9fa4ae112eeba6073804306bb1c13cc71e0d-1761857242739-UniroyalGal-Blackfoot.jpg
5ed4ae23-66e1-4d6b-a21f-c7f656dd7829	wilsons-mufflerMan.jpg	wilsons-mufflerMan.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/2fbdb2e368dc0704b04b327f92642ea215176b6b594a71c4ab2931be47dcbb2f-1761857247040-wilsons-mufflerMan.jpg	image/jpeg	191968	\N	\N			2025-10-30 20:47:31.173761+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/2fbdb2e368dc0704b04b327f92642ea215176b6b594a71c4ab2931be47dcbb2f-1761857247040-wilsons-mufflerMan.jpg
e9a453ac-a1e6-4891-9c56-0e225f237157	murray-toth.jpg	murray-toth.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/5a57f0039600e062e72004b4f069a1d63a8d92ac9461000913610dd9dd355dbc-1761857255679-murray-toth.jpg	image/jpeg	374978	\N	\N			2025-10-30 20:47:44.613299+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/5a57f0039600e062e72004b4f069a1d63a8d92ac9461000913610dd9dd355dbc-1761857255679-murray-toth.jpg
39a9abad-c9df-457f-9582-0db903807109	copperhead-mufflerMan.jpg	copperhead-mufflerMan.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/1947ed44f97b2e39cc48e27a12de2250a1976d13a40109f8b7278420afad160c-1761857283689-copperhead-mufflerMan.jpg	image/jpeg	247435	\N	\N			2025-10-30 20:48:07.637298+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/1947ed44f97b2e39cc48e27a12de2250a1976d13a40109f8b7278420afad160c-1761857283689-copperhead-mufflerMan.jpg
df64c562-da75-452f-9317-141a0b793361	oklahoma-indian.jpg	oklahoma-indian.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/8581928db692762b3484056313763185b85d4889b2f3ed4806089f90b1ce0b96-1761857294648-oklahoma-indian.jpg	image/jpeg	225913	\N	\N			2025-10-30 20:48:18.979418+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/8581928db692762b3484056313763185b85d4889b2f3ed4806089f90b1ce0b96-1761857294648-oklahoma-indian.jpg
751e3b63-23d4-49d3-af5e-006cf334d5aa	iowa-mufflerMan.jpg	iowa-mufflerMan.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/ad4257b71f4ca1410eb39dd5c4eb1b758047c20baccaeca6eff5fe5b4b82cbcf-1761857309424-iowa-mufflerMan.jpg	image/jpeg	141425	\N	\N			2025-10-30 20:48:30.44525+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/ad4257b71f4ca1410eb39dd5c4eb1b758047c20baccaeca6eff5fe5b4b82cbcf-1761857309424-iowa-mufflerMan.jpg
03d756ae-0b9b-40e8-96b1-eebb63a8284e	fountain-drink.jpg	fountain-drink.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/efb70c0565156edc20124a15ac009d5c12d6a64fd568fce5f1861dfbb2950344-1761857313098-fountain-drink.jpg	image/jpeg	65538	\N	\N			2025-10-30 20:48:34.254604+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/efb70c0565156edc20124a15ac009d5c12d6a64fd568fce5f1861dfbb2950344-1761857313098-fountain-drink.jpg
705b013c-00c0-46c6-a66c-957dcced9513	largest-tire.jpg	largest-tire.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/53574c3e5458c4168321862ef5a67bcab24f96b898f14fef18260609eaf90050-1761857315353-largest-tire.jpg	image/jpeg	55600	\N	\N			2025-10-30 20:48:36.649839+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/53574c3e5458c4168321862ef5a67bcab24f96b898f14fef18260609eaf90050-1761857315353-largest-tire.jpg
21983196-e3db-49e1-90e7-5b54151e639a	hexNut.jpg	hexNut.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/dae7f8a28d83654bcb0431465f211107d29f160abb10c0df166cba32bfa3052c-1761857323603-hexNut.jpg	image/jpeg	277811	\N	\N			2025-10-30 20:48:45.405304+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/dae7f8a28d83654bcb0431465f211107d29f160abb10c0df166cba32bfa3052c-1761857323603-hexNut.jpg
a42fd8d8-74c1-41c3-80a1-52850083ad6d	catsup-bottle.jpg	catsup-bottle.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/c6abc9a1a0a97d4a539eb0d5d37acb424baac9c99e4cebb2f5f3056200ed9938-1761857339011-catsup-bottle.jpg	image/jpeg	31993	\N	\N			2025-10-30 20:48:59.58978+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/c6abc9a1a0a97d4a539eb0d5d37acb424baac9c99e4cebb2f5f3056200ed9938-1761857339011-catsup-bottle.jpg
c78afe99-1e58-472a-903a-6222fac58c89	sergio.png	sergio.png	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/42347c3bbc582bf174d3bc9801cb23c9f9e90d7bac81569a0bcd69d35138d11a-1761857461922-sergio.png	image/png	1680961	\N	\N			2025-10-30 20:51:31.73442+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/42347c3bbc582bf174d3bc9801cb23c9f9e90d7bac81569a0bcd69d35138d11a-1761857461922-sergio.png
33f7c5f4-42c3-4af8-9d5d-e9d2a3a6f617	gemini-giant.jpg	gemini-giant.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/af0c91c158543f9d9c807e4d0b12d0b46907016be4b4d8f147f3269cf2550a09-1761857188588-gemini-giant.jpg	image/jpeg	279102	\N	\N			2025-10-30 20:46:31.540474+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/af0c91c158543f9d9c807e4d0b12d0b46907016be4b4d8f147f3269cf2550a09-1761857188588-gemini-giant.jpg
c4389fdf-27a8-4b0e-8797-60b655be01ed	MrBendo-Sioux.jpg	MrBendo-Sioux.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/5f66f73901b42e8eb63bc910713e85a5e083510244c70843b6144be8746999d5-1761857234463-MrBendo-Sioux.jpg	image/jpeg	184059	\N	\N			2025-10-30 20:47:16.53348+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/5f66f73901b42e8eb63bc910713e85a5e083510244c70843b6144be8746999d5-1761857234463-MrBendo-Sioux.jpg
b3c7e85a-00dc-4d9a-87ac-e1bdc8db7e87	Toth-touristPark.jpg	Toth-touristPark.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/cdbed2816a749532aeea97948d00a7a7326b5a76566e8d3bcd433ba283f21fa8-1761857239746-Toth-touristPark.jpg	image/jpeg	423144	\N	\N			2025-10-30 20:47:22.129892+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/cdbed2816a749532aeea97948d00a7a7326b5a76566e8d3bcd433ba283f21fa8-1761857239746-Toth-touristPark.jpg
3f43350f-b454-4825-867b-6bc154e4083f	Wendell-mufflerMan.jpg	Wendell-mufflerMan.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/7e0a2b4abf6a76bace6e2456bafe5f6e4f6aa101087fe68274382cfd32e1ba58-1761857244976-Wendell-mufflerMan.jpg	image/jpeg	238808	\N	\N			2025-10-30 20:47:26.897376+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/7e0a2b4abf6a76bace6e2456bafe5f6e4f6aa101087fe68274382cfd32e1ba58-1761857244976-Wendell-mufflerMan.jpg
cb545622-0264-4d84-b3bd-00a53ceffb3b	mufflerMan-Clean.jpg	mufflerMan-Clean.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/35a384381c3c6ea9775354ae76e3255de3f818bbbc5e89af940750974635d4a2-1761857251397-mufflerMan-Clean.jpg	image/jpeg	400547	\N	\N			2025-10-30 20:47:35.493268+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/35a384381c3c6ea9775354ae76e3255de3f818bbbc5e89af940750974635d4a2-1761857251397-mufflerMan-Clean.jpg
32820fa0-c2bf-43fd-b87a-4155e836cea3	army-mufflerMan.jpg	army-mufflerMan.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/e7737dfd0e3be56c48c56915e6cdddc8a01786ec18543b74d1ce64d4b32393ef-1761857264775-army-mufflerMan.jpg	image/jpeg	412787	\N	\N			2025-10-30 20:48:02.909329+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/e7737dfd0e3be56c48c56915e6cdddc8a01786ec18543b74d1ce64d4b32393ef-1761857264775-army-mufflerMan.jpg
7f750db5-a4a3-4f1b-95b3-af1827ebc5f9	springfield-mufflerMan.jpg	springfield-mufflerMan.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/138406d41f1d3abd08541804b17fedb13e7924e3ce1e39e9cd089aeb101bde5f-1761857289147-springfield-mufflerMan.jpg	image/jpeg	58038	\N	\N			2025-10-30 20:48:14.453501+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/138406d41f1d3abd08541804b17fedb13e7924e3ce1e39e9cd089aeb101bde5f-1761857289147-springfield-mufflerMan.jpg
351b40a5-b530-43da-9c6b-43c2af286143	carrington-indian.jpg	carrington-indian.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/5664190a12cb67794d411867633960997abb5c29ec947f9cc0b015521784c615-1761857299637-carrington-indian.jpg	image/jpeg	194694	\N	\N			2025-10-30 20:48:29.333776+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/5664190a12cb67794d411867633960997abb5c29ec947f9cc0b015521784c615-1761857299637-carrington-indian.jpg
3d09a81f-a38b-466a-be1c-0cee895ac9a4	coal-miner.jpg	coal-miner.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/02bba9a0a42819bb736db194321da2141a79d5d47e4f9b7df08a9be1ae600830-1761857310541-coal-miner.jpg	image/jpeg	48316	\N	\N			2025-10-30 20:48:30.941299+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/02bba9a0a42819bb736db194321da2141a79d5d47e4f9b7df08a9be1ae600830-1761857310541-coal-miner.jpg
af364eb6-39e2-40d1-ba8a-83d813f59e62	Largest-Fork.jpg	Largest-Fork.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/535b9ba6c20993b750c4071bc2220e2d711012c1acff3985755ecbd23857d3c8-1761857314373-Largest-Fork.jpg	image/jpeg	80475	\N	\N			2025-10-30 20:48:35.249395+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/535b9ba6c20993b750c4071bc2220e2d711012c1acff3985755ecbd23857d3c8-1761857314373-Largest-Fork.jpg
9ce2f9c3-06c1-45bf-bf93-afa030df7df7	thirstyMan.jpg	thirstyMan.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/deafae2a96a3da7921ffd4c72d56480d451673ba4794f28cef996a73592c4693-1761857316790-thirstyMan.jpg	image/jpeg	246885	\N	\N			2025-10-30 20:48:38.581397+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/deafae2a96a3da7921ffd4c72d56480d451673ba4794f28cef996a73592c4693-1761857316790-thirstyMan.jpg
4a836193-98e5-468d-8f53-af458f04bbd4	Buffalo.jpg	Buffalo.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/dac7310a177040cff7916713806fd00b50b2b37fe3a6ed00e3def10f289065b6-1761857329694-Buffalo.jpg	image/jpeg	291882	\N	\N			2025-10-30 20:48:52.917216+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/dac7310a177040cff7916713806fd00b50b2b37fe3a6ed00e3def10f289065b6-1761857329694-Buffalo.jpg
f50a0440-c2ca-49d2-9953-e5f4ed20a1bc	largest-peanut.jpg	largest-peanut.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/b2df70de651211987f09d635335ac1cf32aa0ce0a67970047f5d4ee0c419b0ab-1761857342066-largest-peanut.jpg	image/jpeg	130225	\N	\N			2025-10-30 20:49:03.2257+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/b2df70de651211987f09d635335ac1cf32aa0ce0a67970047f5d4ee0c419b0ab-1761857342066-largest-peanut.jpg
0be21506-dc76-4b6e-af9d-d44a9ea8d484	bigDon.jpg	bigDon.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/15303aeeccccefe069536b80d4447658f353ad5e7270b7a46c3c92b581cb9dfa-1761857320848-bigDon.jpg	image/jpeg	361269	\N	\N			2025-10-30 20:48:43.50202+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/15303aeeccccefe069536b80d4447658f353ad5e7270b7a46c3c92b581cb9dfa-1761857320848-bigDon.jpg
78d4e858-d733-4d0a-9ec6-005fcb72fbbd	indian-cheif.jpg	indian-cheif.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/a78f92e992b7647b89662762b03f010b218f61c62c64c17efffdb998df855182-1761857336010-indian-cheif.jpg	image/jpeg	258679	\N	\N			2025-10-30 20:48:58.913944+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/a78f92e992b7647b89662762b03f010b218f61c62c64c17efffdb998df855182-1761857336010-indian-cheif.jpg
470f48f9-6a99-4ecd-90c9-f65ad8892727	pioneer.jpg	pioneer.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/f6fd0bb77fd4b1093fe527f304126e687b10b4c3506e892aff2dc1f5252032e5-1761857343345-pioneer.jpg	image/jpeg	198340	\N	\N			2025-10-30 20:49:04.930886+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/f6fd0bb77fd4b1093fe527f304126e687b10b4c3506e892aff2dc1f5252032e5-1761857343345-pioneer.jpg
678c925f-609c-4a54-93a6-410407ee73fb	IMG_0640.png	IMG_0640.png	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/d4a534b94488976b7a2ff24062681f723a732d55529904ae98ec7c2579a9002d-1761859058579-IMG_0640.png	image/png	2606046	\N	\N			2025-10-30 21:17:50.625449+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/d4a534b94488976b7a2ff24062681f723a732d55529904ae98ec7c2579a9002d-1761859058579-IMG_0640.png
eb125fff-2ff6-4fad-afde-be665b1a7e76	twoHarbors-Toth.jpg	twoHarbors-Toth.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/ce73bb95b8b722c267e31571661c44fc230af02b3a70c700e253207ebcb3f306-1761859712840-twoHarbors-Toth.jpg	image/jpeg	205829	\N	\N			2025-10-30 21:28:34.663072+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	media/ce73bb95b8b722c267e31571661c44fc230af02b3a70c700e253207ebcb3f306-1761859712840-twoHarbors-Toth.jpg
2c1e512d-e0e7-409d-b7ef-8d7457ddf845	largest-turkey.jpg	largest-turkey.jpg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/6a534f20c3e07f0af60e002a216f7d3699fcb6e3ce8dc86a62bd2df66c09ef54-1762285259445-largest-turkey.jpg	image/jpeg	362856	\N	\N			2025-11-04 19:40:59.890942+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	\N
728b8c7d-1f2c-4303-9ec5-bd40f1cfded9	IMG_2553.jpeg	IMG_2553.jpeg	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/e7f0cefc07834b8412cd1bed61ffb4f1627e490112b0073584de836af4fb5c83-1762285585109-IMG_2553.jpeg	image/jpeg	287820	\N	\N			2025-11-04 19:46:25.659068+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	\N
01b58f0b-a6a9-4930-a219-6204f8b85375	IMG_5561.png	IMG_5561.png	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/1a6ce1b02901efe3a7da0fd307d0789ced243fbff4ede258574d19c43b06e4e4-1762287155169-IMG_5561.png	image/png	4796244	\N	\N			2025-11-04 20:12:36.102801+00	2de0f7b7-be75-42a6-a6fb-1a55b43a7220	\N	\N
\.


ALTER TABLE public.media ENABLE TRIGGER ALL;

--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.settings DISABLE TRIGGER ALL;

COPY public.settings (key, value, updated_at, updated_by) FROM stdin;
site_logo	https://fpaxndekwubupxlubvxj.supabase.co/storage/v1/object/public/imageStore/media/e7f0cefc07834b8412cd1bed61ffb4f1627e490112b0073584de836af4fb5c83-1762285585109-IMG_2553.jpeg	2025-11-04T19:46:48.818Z	2de0f7b7-be75-42a6-a6fb-1a55b43a7220
\.


ALTER TABLE public.settings ENABLE TRIGGER ALL;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 9s6TgSEZGlUZTkfGdPERNtSfwpIR8X3aKDkZoGEShgXER5BYu3aZwvq7BSBf1u9

