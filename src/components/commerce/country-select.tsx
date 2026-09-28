"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Country = { code: string; name: string };
const codes = "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SZ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW".split(" ");
const names = new Intl.DisplayNames(["en"], { type: "region" });
const countries = [...new Set(codes)].map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name));
const flagUrl = (code: string) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

function Flag({ code }: { code: string }) { return <Image src={flagUrl(code)} alt="" width={24} height={18} unoptimized className="h-[18px] w-6 rounded-sm object-cover" />; }

export function CountrySelect({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = countries.find((country) => country.code === value);
  const matches = useMemo(() => countries.filter((country) => `${country.name} ${country.code}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="relative"><label className="text-xs uppercase text-ink/60">Country</label><button type="button" onClick={() => setOpen((current) => !current)} className="mt-1 flex w-full items-center justify-between border border-hairline bg-white px-3 py-2 text-left"><span className="flex items-center gap-2">{selected ? <><Flag code={selected.code} /><span>{selected.name}</span></> : "Select country"}</span><span aria-hidden="true">⌄</span></button>{open ? <div className="absolute z-20 mt-1 w-full rounded-sm border border-hairline bg-white p-2 shadow-lg"><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search countries" className="w-full border border-hairline px-3 py-2" /><ul className="mt-2 max-h-56 overflow-y-auto">{matches.map((country) => <li key={country.code}><button type="button" onClick={() => { onChange(country.code); setOpen(false); setQuery(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-ivory-deep"><Flag code={country.code} /><span>{country.name}</span></button></li>)}</ul></div> : null}</div>;
}
