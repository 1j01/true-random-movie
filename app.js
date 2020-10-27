import fitty from "./lib/fitty.module.js";

const title_output = document.getElementById("title-output");
const instance_output = document.getElementById("instance-output");
const watch_online_link = document.getElementById("watch-online-link");
const result_container = document.getElementById("result");
const go_button = document.getElementById("go");
const grande_roulette_ticker = document.getElementById("grande-roulette-ticker");
const grande_roulette_items = document.getElementById("grande-roulette-items");

function mod(n, m) {
	return ((n % m) + m) % m;
}
/**
 * Returns a pseudo-random number generator function that returns 0 to 1 like Math.random()
 */
function sfc32(a, b, c, d) {
	return function () {
		a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
		var t = (a + b) | 0;
		a = b ^ b >>> 9;
		b = c + (c << 3) | 0;
		c = (c << 21 | c >>> 11);
		d = d + 1 | 0;
		t = t + d | 0;
		c = c + t | 0;
		return (t >>> 0) / 4294967296;
	}
}
/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a, random = Math.random) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function parse_title_line(title_line) {
	// parse e.g.
		// "Witch Hunt (1994, 1999 TV & 2019)"
		// "Witchboard 2: The Devil's Doorway (1993)"
			// (colon is not separator unless at end of title)
		// "The Witness (1969 French, 1969 Hungarian, 1992 short, 2000, 2012, 2015 American & 2015 Chinese)"
		// "The Wolf Man (1924 short, 1941)"
			// no &
		// "Fury (1936 & 2012 & 2014)"
			// no ,
		// "Kin Fables (2013-2015 Canadian film project including three short films)"
			// (edited to move description into parentheses)
		// "The Best of Youth (La Meglio gioventù) (2003)"
			// parentheses showing original title
		// "Everything You Always Wanted to Know About Sex* (*But Were Afraid to Ask) (1972)"
			// parentheses in title
		// "(500) Days of Summer (2009)"
			// parentheses in title which is just a number
		// "(Untitled) (2009)"
			// (entirely parenthesized title)
		// "The Fabulous Journey of Mr. Bilbo Baggins, The Hobbit, Across the Wild Land, Through the Dark Forest, Beyond the Misty Mountains. There and Back Again (1985)"
			// really long...

	// don't need to parse, because not included in movies.txt (either cleaned up, missed, or deleted):
		// "Witch Hunt: (1994, 1999 TV & 2019)" (colon before parenthetical)
		// "Act of Violence (1949, 1956, & 1959)" (Oxford comma)
		// "Aabroo, 1943 & 1968" (no parenthetical)
		// "9: (2005 short) & (2009)" (& outside multiple date parentheticals)
		// "Beasties (1985) (1989)" (multiple date parentheticals)
		// "The Betrayed (1993) * (2008)" (typo'd & outside multiple date parentheticals)
		// "Calendar Girls (2015 film) (2015)" (multiple date parentheticals)
		// "Dance of the Dead (2007 film) (2008)" (haha)
		// "The Hobbit (1977 & The Hobbit (1985 film))" (extra end paren)
		// "Aadi (2002 & 2005" (missing end paren)
		// "The Bridge of San Luis Rey]]: (1929, 1944 & 2004)" (typo'd wikipedia syntax)
		// "Die Hard with a Vengeance (1998]" (typo'd wikipedia syntax)
		// "God's Club (2015)[1]" (wikipedia reference)
		// "Accidentally Engaged" (no parenthetical or dates)
		// "Alienator (1989) (TV)" (non-distincting indication in separate parenthetical)
		// "Mermaid's Scar (1993) (OVA)" (non-distincting indication in separate parenthetical)
		// "Five Children and It (film) (2004)" (useless non-distincting indication in separate parenthetical)
		// "Lincoln: Trial by Fire (TV, 1974)" (non-distincting indication separated by comma)
		// "Satyricon (Polidoro, 1969)" (non-distincting indication separated by comma)
		// "Death on the Nile (1978 and 2004 television movie)" (and instead of &)
		// "Le Diable boiteux (1948; tr. The Lame Devil) (translated title in date parenthetical)
		// "Exponát roku 1827 (2008) Czech" (non-distincting indication after parenthetical)
		// "Nation and Destiny series (1992: 2002)" (I think this one's my fault)
		// "Jagadamba (TBD)" (no date)
		// "Kuni Mulgi Deta Ka Mulgi (TBA)" (no date)
		// "Foodfight! (unreleased)" (no date)
		// "Khushiyaan (?)" (no date)

	// var match = /^(.*)\(([^\)]*)\)$/.exec(title_line);
	// if (!match) {
	// 	alert("Failed to parse title line:\n\n" + title_line);
	// 	return;
	// }
	// var [, title, parenthetical] = match;
	// console.log({title, parenthetical});

	var open_paren_index = title_line.lastIndexOf("(");
	var title = title_line.slice(0, open_paren_index);
	var parenthetical = title_line.slice(open_paren_index + 1, -1);
	// console.log({title, parenthetical});

	title = title.trim();
	// if (title.lastIndexOf(":") === title.length - 1) {
	// 	title = title.slice(0, -1);
	// }

	const instances = parenthetical.split(/[,&]\s*/g).map((str) => str.trim());

	return { title, parenthetical, instances };
}

const display_result = (title_line) => {

	window.console && console.log(title_line);
	var { title, parenthetical, instances } = parse_title_line(title_line);
	window.console && console.log({ title, parenthetical, instances });

	var instance_index = ~~(Math.random() * instances.length);
	var instance_text = instances[instance_index];

	title_output.innerHTML = "";
	let heading_level = 2;
	for (const title_part of title.split(/:\s/g)) {
		const scale_wrapper = document.createElement("div");
		const heading = document.createElement(`h${heading_level}`);
		heading.textContent = title_part;
		heading.classList.add("scale-to-fit-width");
		scale_wrapper.append(heading);
		title_output.append(scale_wrapper);
		heading_level += 1;
	}

	instance_output.textContent = `(${instance_text})`;

	watch_online_link.href = `https://google.com/search?q=${encodeURIComponent(
		`${title} (${instance_text.replace(/\sTV$/, "")}) (watch online)`
	)}`;

	result_container.hidden = false;

	fitty(".scale-to-fit-width", { maxSize: 200 });
	fitty.fitAllImmediately();
	// TODO: make sure fitty gets cleaned up
};

let title_lines;
let original_indexes;

// TODO: use pool of elements to avoid garbage collection churn?
let animating = false;
let dragging = false;
let peg_hit_timer = 0;
const item_els = [];
let item_els_by_index = {};
let spin_position = 0;
let last_spin_position = 0;
let spin_velocity = 0;
let ticker_index_attachment = 0;
let ticker_rotation_deg = 0;
let ticker_rotation_speed_deg_per_frame = 0;
const renderGrandeRoulette = () => {
	const item_height = parseFloat(getComputedStyle(grande_roulette_items).getPropertyValue("--item-height"));
	const visible_range = Math.ceil(grande_roulette_items.offsetHeight / item_height);
	const min_visible_index = Math.floor(spin_position - visible_range / 2);
	const max_visible_index = Math.ceil(spin_position + visible_range / 2 + 1);
	for (let i = min_visible_index; i < max_visible_index; i += 1) {
		const index = mod(i, title_lines.length);
		if (!item_els_by_index[index]) {
			const item_el = document.createElement("div");
			item_el.className = "grande-roulette-item";
			item_el.style.background = `hsl(${original_indexes[index] / title_lines.length}turn, 80%, 50%)`;
			// item_el.style.background = `hsl(${index ** 1.1}turn, 80%, 50%)`;
			// item_el.style.background = `hsl(${index ** 0.1}turn, 80%, 50%)`;
			item_el.textContent = title_lines[index].replace(/([!?.,]):/g, "$1");
			item_el.virtualListIndex = index;

			item_els_by_index[index] = item_el;
			item_els.push(item_el);
			grande_roulette_items.append(item_el);
		}
	}
	// have to iterate backwards because items can be removed during iteration
	for (let i = item_els.length - 1; i >= 0; i--) {
		const item_el = item_els[i];
		const index = item_el.virtualListIndex;
		let y = mod(spin_position - index, title_lines.length);
		if (y > visible_range) {
			y -= title_lines.length;
		}
		if (y > visible_range / 2 + 1 || y < -visible_range / 2 - 1) {
			item_el.remove();
			delete item_els_by_index[index];
			const item_els_index = item_els.indexOf(item_el);
			if (item_els_index > -1) {
				item_els.splice(item_els_index, 1);
			} else {
				console.error(item_els_index);
			}
		} else {
			item_el.style.transform = `translateY(${(y - 1 / 2).toFixed(5) * item_height}px)`;
		}
	}
};
let rafid;
const animate = () => {
	rafid = requestAnimationFrame(animate);
	animating = true;
	renderGrandeRoulette();

	// grande_roulette_ticker.style.textShadow = "0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 5px black, 0 0 5px black, 0 0 6px black, 0 0 5px black, 0 0 7px black, 0 0 8px black";
	// grande_roulette_ticker.textContent =
	// 	// Math.abs(spin_position - ticker_index_attachment)
	// 	// Math.sign(spin_position - ticker_index_attachment);
	// 	// Math.round(spin_position + 0.1 * Math.sign(spin_position - ticker_index_attachment));
	// 	(mod(Math.abs(spin_position - ticker_index_attachment + 0.5), 1))
	// 		.toFixed(2);
	const pass_peg_limit = 0.5;
	const peg_size = 0.1;
	const peg_pushback = 1 / 25000;
	if (
		ticker_index_attachment !== Math.round(spin_position + peg_size * Math.sign(spin_position - ticker_index_attachment)) &&
		(mod(Math.abs(spin_position - ticker_index_attachment + 1 / 2 + peg_size * Math.sign(spin_position - ticker_index_attachment)), 1)) < pass_peg_limit
	) {
		// grande_roulette_ticker.textContent = "hooked";
		// grande_roulette_ticker.style.color = "green";
		ticker_rotation_deg = (spin_position - ticker_index_attachment - (1 / 2 - peg_size) * Math.sign(spin_position - ticker_index_attachment)) * 38;
		ticker_rotation_speed_deg_per_frame = spin_velocity * 50;
		spin_velocity -= ticker_rotation_deg * peg_pushback;
		peg_hit_timer = 50;
	} else {
		// grande_roulette_ticker.textContent = "free";
		// grande_roulette_ticker.style.color = "red";
		ticker_rotation_deg *= 0.7;
		ticker_index_attachment = Math.round(spin_position);
	}
	// grande_roulette_ticker.textContent += ` | ${ticker_index_attachment} | ${spin_position.toFixed(2)} |`;
	// if (
	// 	ticker_index_attachment !== Math.round(spin_position)
	// ) {
	// 	grande_roulette_ticker.textContent += " hooky";
	// } else {
	// 	grande_roulette_ticker.textContent += " freaky";
	// }

	if (dragging) {
		spin_velocity = 0;
	}
	spin_position += spin_velocity;
	spin_velocity *= 0.99;
	// ticker_rotation_deg += ticker_rotation_speed_deg_per_frame;
	// ticker_rotation_speed_deg_per_frame *= 0.2;
	// ticker_rotation_speed_deg_per_frame -= ticker_rotation_deg / 50;
	// ticker_rotation_deg /= Math.exp(ticker_rotation_deg / 100)
	// ticker_rotation_deg = Math.min(70, Math.max(-70, ticker_rotation_deg));
	const limit = 70 + Math.random() * 30;
	ticker_rotation_deg = Math.min(limit, Math.max(-limit, ticker_rotation_deg));

	last_spin_position = spin_position;

	if (peg_hit_timer > 0) {
		peg_hit_timer -= 1;
	}
	if (Math.abs(spin_velocity) < 0.01 && !dragging && peg_hit_timer <= 0) {
		const title_line = title_lines[mod(Math.round(spin_position), title_lines.length)];
		display_result(title_line);
		spin_velocity = 0;
		ticker_rotation_deg = 0;
		animating = false;
		cancelAnimationFrame(rafid);
	}

	grande_roulette_ticker.style.transform = `translateY(-50%) rotate(${ticker_rotation_deg}deg) scaleY(0.5)`;
};

const main = async () => {
	const response = await fetch("movies.txt");
	// const response = await fetch("test-subtitles.txt");
	const text = await response.text();

	const original_title_lines = text.trim().split(/\r?\n/g);

	original_indexes = new Int32Array(original_title_lines.length);
	for (let i = 0; i < original_indexes.length; i++) {
		original_indexes[i] = i;
	}
	const prng = sfc32(1, 2, 3, 4);
	shuffle(original_indexes, prng);

	title_lines = [];
	for (let i = 0; i < original_indexes.length; i++) {
		title_lines[i] = original_title_lines[original_indexes[i]];
	}

	spin_position = Math.random() * title_lines.length;
	ticker_index_attachment = spin_position;

	renderGrandeRoulette();
	
	window.addEventListener("resize", renderGrandeRoulette);

	grande_roulette_items.style.touchAction = "none";
	grande_roulette_items.addEventListener("pointerdown", (event) => {
		dragging = true;
		spin_velocity = 0;
		const item_height = parseFloat(getComputedStyle(grande_roulette_items).getPropertyValue("--item-height"));
		const start_y = event.clientY;
		const start_spin_position = spin_position;
		let y_velocity_energy = 0;
		let last_event_time = performance.now();
		let last_event_y = start_y;
		const onPointerMove = (event) => {
			const new_y = event.clientY;
			const new_time = performance.now();
			spin_position = start_spin_position + (new_y - start_y) / item_height;
			if (!animating) {
				animate();
			}
			y_velocity_energy += (new_y - last_event_y) * (new_time - last_event_time);
			last_event_time = new_time;
			last_event_y = new_y;
		};
		setInterval(() => {
			y_velocity_energy *= 0.8;
		});
		const onPointerUp = () => {
			grande_roulette_items.removeEventListener("pointermove", onPointerMove);
			grande_roulette_items.removeEventListener("pointerup", onPointerUp);
			grande_roulette_items.removeEventListener("pointercancel", onPointerUp);
			spin_velocity = y_velocity_energy / 1000;
			dragging = false;
			if (!animating) {
				animate();
			}
		};
		grande_roulette_items.addEventListener("pointermove", onPointerMove);
		grande_roulette_items.addEventListener("pointerup", onPointerUp);
		grande_roulette_items.addEventListener("pointercancel", onPointerUp);
	});

	go_button.onclick = () => {
		if (!animating) {
			spin_velocity = 50 + Math.random() * 50;
			animate();
		}

		// const index = Math.floor(Math.random() * title_lines.length);
		// const title_line = title_lines[index];

		// display_result(title_line);
	};

	// TODO: remove duplicate movie listings
	// also look for two vs 2 etc.
	// window.titles = new Map();
	// for (const title_line of title_lines) {
	// 	const parsed = parse_title_line(title_line);
	// 	if (titles.get(parsed.title)) {
	// 		// console.log("Collision!", titles.get(parsed.title), "and", parsed);
	// 		if (parsed.parenthetical !== titles.get(parsed.title).parenthetical) {
	// 			// console.log("listed differently!", titles.get(parsed.title), "and", parsed);
	// 			console.log("listed differently!", parsed.title, titles.get(parsed.title).parenthetical, "vs", parsed.parenthetical);
	// 		}
	// 	}
	// 	titles.set(parsed.title, parsed);
	// }

};

main();
