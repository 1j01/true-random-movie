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
		// "Witch Hunt: (1994, 1999 TV & 2019)"
		// "Witchboard 2: The Devil's Doorway (1993)"
			// (colon is not separator unless at end of title)
		// "The Witness: (1969 French, 1969 Hungarian, 1992 short, 2000, 2012, 2015 American & 2015 Chinese)"
		// "The Wolf Man: (1924 short, 1941)"
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
		// "Aabroo, 1943 & 1968"
		// "9: (2005 short) & (2009)"
		// "Beasties (1985) (1989)"
		// "The Betrayed (1993) * (2008)" weird
		// "Calendar Girls (2015 film) (2015)"
		// "Dance of the Dead (2007 film) (2008)" haha
		// "The Hobbit (1977 & The Hobbit (1985 film))"
		// "Aadi (2002 & 2005"
		// "The Bridge of San Luis Rey]]: (1929, 1944 & 2004)"
		// "Die Hard with a Vengeance (1998]"
		// "God's Club (2015)[1]"
		// "Accidentally Engaged"
		// "Alienator (1989) (TV)"
		// "Lincoln: Trial by Fire (TV, 1974)"
		// "Satyricon (Polidoro, 1969)"
		// "Mermaid's Scar (1993) (OVA)"
		// "Five Children and It (film) (2004)"
		// "Death on the Nile (1978 and 2004 television movie)"
		// "Le Diable boiteux (1948; tr. The Lame Devil)""
		// "Exponát roku 1827 (2008) Czech"
		// "Nation and Destiny series (1992: 2002)"
		// "Jagadamba (TBD)"
		// "Kuni Mulgi Deta Ka Mulgi (TBA)"
		// "Foodfight! (unreleased)"
		// "Khushiyaan (?)"

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
	// TODO: make sure fitty gets cleaned up
};

let title_lines;
let original_indexes;

// TODO: use pool of elements to avoid garbage collection churn?
let animating = false;
const item_els = [];
let item_els_by_index = {};
let spin_position = 0;
let spin_velocity = 0;
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

	spin_position += spin_velocity;
	spin_velocity *= 0.99;

	if (Math.abs(spin_velocity) < 0.01) {
		const title_line = title_lines[mod(Math.round(spin_position), title_lines.length)];
		display_result(title_line);
		spin_velocity = 0;
		animating = false;
		cancelAnimationFrame(rafid);
	}
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

	renderGrandeRoulette();
	
	window.addEventListener("resize", renderGrandeRoulette);

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
