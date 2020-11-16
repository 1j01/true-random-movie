import fitty from "./lib/fitty.module.js";

const title_output = document.getElementById("title-output");
const instance_output = document.getElementById("instance-output");
const watch_online_link = document.getElementById("watch-online-link");
const copy_to_clipboard_button = document.getElementById("copy-to-clipboard")
const result_container = document.getElementById("result");
const go_button = document.getElementById("go");
const mega_spinner_container = document.getElementById("mega-spinner");
const mega_spinner_svg = document.getElementById("mega-spinner-svg");
const mega_spinner_ticker = document.getElementById("mega-spinner-ticker");
const mega_spinner_items = document.getElementById("mega-spinner-items");
const plinketto_svg = document.getElementById("plinketto-svg");
const filters = document.getElementById("filters");
const close_filters_button = document.getElementById("close-filters");
const title_filter = document.getElementById("title-filter");

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
		// "Grass Roots (production)" (no date)
		// "Khushiyaan (?)" (no date)

	var open_paren_index = title_line.lastIndexOf("(");
	if (open_paren_index === -1) {
		return;
	}
	var title = title_line.slice(0, open_paren_index);
	var parenthetical = title_line.slice(open_paren_index + 1, -1);

	title = title.trim();

	const instances = parenthetical.split(/[,&]\s*/g).map((str) => str.trim());

	return { title, parenthetical, instances };
}

let displayed_title;

const display_result = (title_line) => {

	const parsed = parse_title_line(title_line);
	const { title, instances } = parsed;

	var instance_index = ~~(Math.random() * instances.length);
	var instance_text = instances[instance_index];

	title_output.innerHTML = "";
	let heading_level = 2;
	const title_parts = title.split(/:\s/g);
	for (let title_part_index = 0; title_part_index < title_parts.length; title_part_index++) {
		const title_part = title_parts[title_part_index];
		const scale_wrapper = document.createElement("div");
		const heading = document.createElement(`h${heading_level}`);
		const small_start_match = title_part.match(/^((?:in |on |and | with )(?:the )?|(?:the movie\b))(.*)/i);
		const prevent_small_start_match = title_part.match(/In The Lair|In the Beginning|In Your|In It To/i);
		let remaining_title_part = title_part;
		if (small_start_match && title_part_index > 0 && !prevent_small_start_match) {
			const small_span = document.createElement("span");
			small_span.style.fontSize = "0.5em";
			small_span.textContent = small_start_match[1];
			heading.append(small_span);
			remaining_title_part = small_start_match[2];
		}
		const small_mid_match = remaining_title_part.match(/(.*)(\svs?\.?\s)(.*)/i);
		if (small_mid_match) {
			heading.append(document.createTextNode(small_mid_match[1]));
			const small_span = document.createElement("span");
			small_span.style.fontSize = "0.7em";
			small_span.textContent = small_mid_match[2];
			heading.append(small_span);
			remaining_title_part = small_mid_match[3];
		}
		heading.append(document.createTextNode(remaining_title_part));
		heading.classList.add("scale-to-fit-width");
		scale_wrapper.append(heading);
		title_output.append(scale_wrapper);
		heading_level += 1;
	}

	instance_output.textContent = `(${instance_text})`;

	watch_online_link.href = `https://duckduckgo.com/?q=${encodeURIComponent(
		`${title} (${instance_text.replace(/\sTV$/, "")}) (watch online)`
	)}`;

	copy_to_clipboard_button.onclick = async () => {
		await navigator.clipboard.writeText(`${title} (${instance_text.replace(/\sTV$/, "")})`);
	};

	result_container.hidden = false;
	result_container.style.transition = "unset";
	setTimeout(() => {
		result_container.style.opacity = 1;
		setTimeout(() => {
			result_container.style.transition = "";
		}, 15);
	});

	const headings = [...document.querySelectorAll(".scale-to-fit-width")];
	headings[headings.length - 1].addEventListener("fit", () => {
		// fitty handles scaling individual headings with a max size,
		// but I want to scale things down in proportion to each other in some cases

		// Prevent subtitles from being larger than main title
		// (Note: sometimes this isn't really good, where the first title isn't the most important part)
		// const mainTitleFontSize = parseFloat(headings[0].style.fontSize);
		// headings.forEach((heading) => {
		// 	if (heading !== headings[0] && parseFloat(heading.style.fontSize) >= mainTitleFontSize) {
		// 		heading.style.fontSize = `${mainTitleFontSize * 0.8}px`;
		// 	}
		// });
		// Limit overall font size, scaling things down proportionally
		const maxFontSize = 100;
		if (headings.some((heading) => parseFloat(heading.style.fontSize) > maxFontSize)) {
			const largest = headings.reduce((prevMax, heading) => Math.max(prevMax, parseFloat(heading.style.fontSize)), 0);
			headings.forEach((heading) => {
				heading.style.fontSize = `${parseFloat(heading.style.fontSize) / largest * maxFontSize}px`
			});
		}
	});
	fitty(".scale-to-fit-width", { maxSize: 200 });
	fitty.fitAllImmediately();
	// TODO: make sure fitty gets cleaned up

	displayed_title = title;
};

const clear_result = () => {
	result_container.hidden = true;
	result_container.style.opacity = 1;
	displayed_title = null;
};

fitty("#go", { maxSize: 30 });

let unfiltered_title_lines;
let normalized_unfiltered_title_lines; // for loose string comparison
let title_line_indexes; // can be a sorted/shuffled/filtered/wrapped list of indexes into unfiltered_title_lines
let shuffled_unfiltered_title_line_indexes; // for restoring from filtering

// TODO: use pool of elements to avoid garbage collection churn?
let animating = false;
let dragging = false;
let peg_hit_timer = 0;
let item_els = [];
let spin_position = 0;
let spin_velocity = 0;
let ticker_index_attachment = 0;
let ticker_rotation_deg = 0;
// let ticker_rotation_speed_deg_per_frame = 0;
const render_mega_spinner = () => {
	// Fix for mobile chrome (not in Desktop Site mode, and either: 1. not after a refresh or 2. after a refresh and then rotating the phone)
	// I think it relates to the top bar UI that can hide/show when scrolling a page.
	mega_spinner_container.style.top = `${(mega_spinner_container.clientHeight - mega_spinner_svg.getBoundingClientRect().height) / 2}px`;

	const item_height = parseFloat(getComputedStyle(mega_spinner_items).getPropertyValue("--item-height"));
	const visible_range = Math.ceil(mega_spinner_container.clientHeight / item_height);
	const min_visible_index = Math.floor(spin_position - visible_range / 2);
	const max_visible_index = Math.ceil(spin_position + visible_range / 2 + 1);

	let item_el_index = 0;
	let item_el = item_els[item_el_index];
	const new_item_els_list = [];
	let to_remove_item_els = [];
	for (let i = min_visible_index; i < max_visible_index; i += 1) {
		// there's gotta be a better way to name these things
		const title_line_index_index = mod(i, title_line_indexes.length);
		const title_line_index = title_line_indexes[title_line_index_index];
		const title_line = unfiltered_title_lines[title_line_index];
		// let y = mod(spin_position - i, title_line_indexes.length);
		let y = spin_position - i;
		if (y > visible_range) {
			y -= title_line_indexes.length;
		}
		item_el = item_els[item_el_index];
		if (item_el && item_el.title_line_index_index === title_line_index_index) {
			new_item_els_list.push(item_el);
		} else if (item_el) {
			to_remove_item_els.push(item_el);
			item_el = null;
		}

		if (!item_el) {
			item_el = document.createElementNS("http://www.w3.org/2000/svg", "g");
			item_el.setAttribute("class", "mega-spinner-item");
			const rect_el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			rect_el.setAttribute("fill", `hsl(${title_line_index / unfiltered_title_lines.length}turn, 80%, 50%)`);
			rect_el.setAttribute("x", 0);
			rect_el.setAttribute("y", 0);
			rect_el.setAttribute("width", "100%");
			rect_el.setAttribute("height", item_height);
			const text_el = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text_el.setAttribute("dominant-baseline", "middle");
			text_el.setAttribute("x", 15);
			text_el.setAttribute("y", item_height / 2);
			text_el.textContent = title_line.replace(/([!?.,]):/g, "$1");
			item_el.title_line_index_index = title_line_index_index;
			const peg_el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			peg_el.setAttribute("cx", peg_size_px / 2);
			peg_el.setAttribute("cy", item_height);
			peg_el.setAttribute("r", peg_size_px / 2);
			item_el.appendChild(rect_el);
			item_el.appendChild(text_el);
			item_el.appendChild(peg_el);
			mega_spinner_items.appendChild(item_el);
			new_item_els_list.push(item_el);
		}

		item_el.style.transform = `translateY(${(y - 1 / 2).toFixed(5) * item_height}px)`;

		item_el_index += 1;
	}
	to_remove_item_els = to_remove_item_els.concat(item_els.slice(item_el_index));
	to_remove_item_els.forEach((el) => el.remove());
	item_els = new_item_els_list;

	mega_spinner_ticker.style.transform = `translateY(-50%) rotate(${ticker_rotation_deg}deg) scaleY(0.5)`;

};

const pass_peg_limit = 0.5;
const peg_size = 0.1;
const peg_size_px = 5;
const peg_pushback = 1 / 2500000;
const time_step = 1; // delta times are broken up into chunks this size or smaller
const simulate_mega_spinner = (delta_time) => {
	// I'm not totally sure this variable name makes sense:
	const ticker_index_occupancy = Math.round(spin_position + peg_size * Math.sign(spin_position - ticker_index_attachment));
	if (
		ticker_index_attachment !== ticker_index_occupancy &&
		(mod(Math.abs(spin_position - ticker_index_attachment + 1 / 2 + peg_size * Math.sign(spin_position - ticker_index_attachment)), 1)) < pass_peg_limit
	) {
		ticker_rotation_deg = (spin_position - ticker_index_attachment - (1 / 2 - peg_size) * Math.sign(spin_position - ticker_index_attachment)) * 38;
		// ticker_rotation_speed_deg_per_frame = spin_velocity * 50;
		spin_velocity -= ticker_rotation_deg * peg_pushback * delta_time;
		peg_hit_timer = 500;
		// Limit attachment to an adjacent item.
		// This fixes a case where you stop the spinner while it's moving fast and it's on a peg.
		// With the random limit below (not sure I'll keep that) it flipped out, but it could also just stay in one place but not in a physically plausible way
		// TODO: handle wrapping seamlessly? this is very much an edge case and you probably wouldn't notice
		// i.e. if one of these indices is 0
		if (ticker_index_attachment < ticker_index_occupancy) {
			ticker_index_attachment = ticker_index_occupancy - 1;
		} else {
			ticker_index_attachment = ticker_index_occupancy + 1;
		}
	} else {
		ticker_rotation_deg -= 0.03 * ticker_rotation_deg * delta_time;
		ticker_index_attachment = Math.round(spin_position);
	}

	if (dragging) {
		spin_velocity = 0;
	}
	spin_position += spin_velocity * delta_time;
	spin_velocity -= 0.001 * spin_velocity * delta_time;

	// ticker_rotation_deg += ticker_rotation_speed_deg_per_frame;
	// ticker_rotation_speed_deg_per_frame *= 0.2;
	// ticker_rotation_speed_deg_per_frame -= ticker_rotation_deg / 50;
	const limit = 70 + Math.random() * 30;
	ticker_rotation_deg = Math.min(limit, Math.max(-limit, ticker_rotation_deg));

	if (peg_hit_timer > 0) {
		peg_hit_timer -= delta_time;
	}
};

let plinketto_pegs = [];
let plinketto_balls = []; // or pucks, but that looks too similar to "buckets" for visual scanning :)
let plinketto_buckets = [];

const render_plinketto = () => {
	plinketto_svg
	for (const ball of plinketto_balls) {
		if (!ball.element) {
			ball.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			ball.element.setAttribute("class", "plinketto-ball");
			plinketto_svg.appendChild(ball.element);
		}
		ball.element.setAttribute("cx", ball.x);
		ball.element.setAttribute("cy", ball.y);
		ball.element.setAttribute("r", ball.radius);
	}
	for (const peg of plinketto_pegs) {
		if (!peg.element) {
			peg.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			peg.element.setAttribute("class", "plinketto-peg");
			plinketto_svg.appendChild(peg.element);
		}
		peg.element.setAttribute("cx", peg.x);
		peg.element.setAttribute("cy", peg.y);
		peg.element.setAttribute("r", peg.radius);
	}
	let i = 0;
	for (const bucket of plinketto_buckets) {
		i++;
		if (!bucket.element) {
			bucket.element = document.createElementNS("http://www.w3.org/2000/svg", "g");
			bucket.element.setAttribute("class", "plinketto-bucket");
			const rect_el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			rect_el.setAttribute("fill", `hsl(${i / plinketto_buckets.length}turn, 80%, 50%)`);
			rect_el.setAttribute("x", bucket.x);
			rect_el.setAttribute("y", bucket.y);
			rect_el.setAttribute("width", bucket.width);
			rect_el.setAttribute("height", bucket.height);
			const text_el = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text_el.setAttribute("dominant-baseline", "middle");
			text_el.setAttribute("text-anchor", "middle");
			text_el.setAttribute("x", bucket.x + bucket.width / 2);
			text_el.setAttribute("y", bucket.y + bucket.height / 2);
			text_el.textContent = bucket.id;
			bucket.element.appendChild(rect_el);
			bucket.element.appendChild(text_el);
			plinketto_svg.appendChild(bucket.element);
		}
		bucket.element.setAttribute("x", bucket.x);
		bucket.element.setAttribute("y", bucket.y);
		bucket.element.setAttribute("width", bucket.width);
		bucket.element.setAttribute("height", bucket.height);
	}
};

const gravity = 0.0005;
const air_friction_x = 0.001;
const air_friction_y = 0.001;
const collision_friction_x = 0.04;
const collision_friction_y = 0.04;

const simulate_plinketto = (delta_time) => {
	for (const ball of plinketto_balls) {
		ball.velocity_y += gravity * delta_time;
		ball.velocity_x -= ball.velocity_x * air_friction_x * delta_time;
		ball.velocity_y -= ball.velocity_y * air_friction_y * delta_time;
		ball.x += ball.velocity_x * delta_time;
		ball.y += ball.velocity_y * delta_time;
		for (const peg of plinketto_pegs) {
			const distance_of_centers = Math.hypot(ball.x - peg.x, ball.y - peg.y);
			const distance_of_edges = distance_of_centers - peg.radius - ball.radius;
			if (distance_of_edges < 0) {
				ball.velocity_x += (ball.x - peg.x) / distance_of_centers * 0.005 * delta_time;
				ball.velocity_y += (ball.y - peg.y) / distance_of_centers * 0.005 * delta_time;
				ball.velocity_x -= ball.velocity_x * collision_friction_x * delta_time;
				ball.velocity_y -= ball.velocity_y * collision_friction_y * delta_time;
			}
		}
		if (ball.x + ball.radius > 100) {
			ball.velocity_x = -Math.abs(ball.velocity_x) * 0.9;
		}
		if (ball.x - ball.radius < 0) {
			ball.velocity_x = Math.abs(ball.velocity_x) * 0.9;
		}
		if (ball.y + ball.radius > 90) {
			ball.velocity_y = -Math.abs(ball.velocity_y) * 0.9;
			ball.y = Math.min(ball.y, 90 - ball.radius);
		}
	}
};

const cleanup_plinketto = () => {
	// Array.from is necessary because it's a live NodeList, updated as things are removed
	for (const child of Array.from(plinketto_svg.childNodes)) {
		child.remove();
	}
	plinketto_buckets.length = 0;
	plinketto_balls.length = 0;
	plinketto_pegs.length = 0;
};

const setup_plinketto = (options) => {
	cleanup_plinketto();

	for (let i = 0; i < options.length; i += 1) {
		const x = i * 100 / options.length;
		plinketto_buckets.push({
			id: options[i],
			x: x,
			y: 90,
			width: 100 / options.length,
			height: 10,
		});
		if (i > 0) {
			for (let y = 83; y < 90; y += 2) {
				plinketto_pegs.push({
					x, y,
					radius: 0.8,
				});
			}
		}
	}
	const x_spacing = 5;
	const y_spacing = 5;
	for (let y = y_spacing * 3; y < 80; y += y_spacing) {
		for (let x = (y % (y_spacing * 2)) ? x_spacing / 2 : 0; x < 100; x += x_spacing) {
			plinketto_pegs.push({
				x, y,
				radius: 0.8,
			});
		}
	}
	for (let x = 0; x < 100; x += x_spacing) {
		plinketto_balls.push({
			x: 50, y: 1,
			velocity_x: Math.random() * 0.003,
			velocity_y: 0,
			radius: 1.2,
		});
	}

	plinketto_balls.push({
		x: 0,
		y: 1,
		velocity_x: Math.random() * 10,
		velocity_y: 0,
		radius: 1.2,
	});
};

window.plinketto = () => {
	setup_plinketto(["1913", "1922", "1933", "1946"]);
	render_plinketto();
};
plinketto();

let rafid;
let last_time = performance.now();
const animate = () => {
	rafid = requestAnimationFrame(animate);
	const now = performance.now();
	const delta_time = Math.min(now - last_time, 500); // limit needed to handle if the page isn't visible for a while; scalar can be refactored out
	animating = true;

	let remaining_delta_time = delta_time;
	while (remaining_delta_time > 0) {
		// simulate_mega_spinner(Math.min(time_step, remaining_delta_time));
		simulate_plinketto(Math.min(time_step, remaining_delta_time));
		remaining_delta_time -= time_step;
	}

	const title_line = unfiltered_title_lines[title_line_indexes[mod(ticker_index_attachment, title_line_indexes.length)]];
	const moved_away_from_displayed_title = parse_title_line(title_line).title !== displayed_title;
	if (Math.abs(spin_velocity) < 0.001 && !dragging && peg_hit_timer <= 0) {
		if (moved_away_from_displayed_title) {
			display_result(title_line);
			// location.hash = `${title} (${instance_text.replace(/\sTV$/, "")})`;
			// location.hash = `${title} (${instance_text})`;
			location.hash = title_line;
			if (Math.abs(spin_velocity) < 0.0001 && Math.abs(ticker_rotation_deg) < 0.01) {
				spin_velocity = 0;
				ticker_rotation_deg = 0;
				// animating = false;
				// cancelAnimationFrame(rafid);
			}
		}
		document.body.classList.remove("spinner-active");
	} else if (moved_away_from_displayed_title) {
		document.body.classList.add("spinner-active");
		result_container.style.opacity = 0;
		displayed_title = null;
	}

	render_mega_spinner();
	render_plinketto();

	last_time = now;
};

const normalizations = [
	"ONE",
	"TWO",
	"THREE",
	"FOUR",
	"FIVE",
	"SIX",
	"SEVEN",
	"EIGHT",
	"NINE",
	"TEN",
	"ELEVEN",
	"TWELVE",
	"VERSUS",
	// should this include roman numerals?
	// ensure a substring of a matching search will ALWAYS match, or would it be weird?
];
const normalize_title = (title) =>
	// Note: I is a common word; might want to not normalize it in some cases
	// Note: some titles use numbers, especially 2, in different ways, like in place of "to" or "too"
	title.normalize("NFKD")
		.toLocaleUpperCase()
		.replace(/[\u0300-\u036f]/g, "") // probably not needed with "NFKD"
		.replace(/\s(VS?\.?|VERSUS)(\s|$)/g, " {VERSUS} ")
		.replace(/\b(1|I(?!,|\s)|ONE)\b/g, "{1}")
		.replace(/\b(2|II|TWO)\b/g, "{2}")
		.replace(/\b(3|III|THREE)\b/g, "{3}")
		.replace(/\b(4|IV|IIII|FOUR)\b/g, "{4}")
		.replace(/\b(5|V(?!\s)|IIIII|FIVE)\b/g, "{5}")
		.replace(/\b(6|VI|IIIIII|IIIIX|SIX)\b/g, "{6}")
		.replace(/\b(7|VII|IIIX|SEVEN)\b/g, "{7}")
		.replace(/\b(8|VIII|IIX|EIGHT)\b/g, "{8}")
		.replace(/\b(9|IX|VIIII|NINE)\b/g, "{9}")
		.replace(/\b(10|X|TEN)\b/g, "{10}")
		.replace(/\b(11|XI|ELEVEN)\b/g, "{11}")
		.replace(/\b(12|XII|TWELVE)\b/g, "{12}");

const search_matches_normalized_title = (search, normalized_title) => {
	const simply_normalized_search = normalize_title(search);
	// if (normalized_title.slice(0, simply_normalized_search.length) === simply_normalized_search) {
	if (normalized_title.indexOf(simply_normalized_search) > -1) {
		return true;
	}
	const search_upper = search.toLocaleUpperCase();
	for (const normalization of normalizations) {
		for (let i = 1; i < normalization.length; i++) {
			if (search_upper.slice(search_upper.length - i) === normalization.slice(0, i)) {
				const autocompleted = `${search_upper}${normalization.slice(i)}`;
				const autocomplete_normalized = normalize_title(autocompleted);
				// if (normalized_title.slice(0, autocomplete_normalized.length) === autocomplete_normalized) {
				if (normalized_title.indexOf(autocomplete_normalized) > -1) {
					return true;
				}
			}
		}
	}
	return false;
};

const search_matches_title = (search, title) => search_matches_normalized_title(search, normalize_title(title));

const show_normalization = (a, b) => {
	const indent = "    ";
	return `
Original titles:
${indent}"${a}"
${indent}"${b}"

Normalized:
${indent}"${normalize_title(a)}"
${indent}"${normalize_title(b)}"
`;
};
for (const [a, b] of [
	["Psycho IV: The Beginning (1990)", "Psycho 4: The Beginning (1990)"],
	["1: The Movie", "One: The Movie"],
	["The Human Condition I: No Greater Love (1959)", "The Human Condition One: No Greater Love (1959)"],
	["The Uchōten Hotel", "The Uchoten Hotel"],
	["Omen III", "Omen Three"],
	["Meatballs II", "Meatballs 2"],
	["Star Wars: Episode VI: Return of the Jedi (1983)", "Star Wars: Episode Six: Return of the Jedi (1983)"],
	["Star Wars: Episode VI: Return of the Jedi (1983)", "Star Wars: Episode Ⅵ: Return of the Jedi (1983)"],
	["2 Fast 2 Furious (2003)", "Two Fast II Furious (2003)"],
	// ["2 Fast 2 Furious (2003)", "Too Fast Too Furious (2003)"],
	["Roe v. Wade", "Roe vs. Wade"],
]) {
	if (console && console.assert) {
		console.assert(normalize_title(a) === normalize_title(b), `Normalized titles should be equal.
${show_normalization(a, b)}
`);
	}
}
for (const [a, b] of [
	["Furious (200three)", "Furious (2003)"],
	["Furious (II003)", "Furious (2003)"],
	["One, t", "I, T"], // I, The Jury
	["I as in Icarus (1979)", "One as in Icarus (1979)"],
]) {
	if (console && console.assert) {
		console.assert(normalize_title(a) !== normalize_title(b), `Normalized titles SHOULD NOT BE EQUAL but are.
${show_normalization(a, b)}
`);
	}
}
for (const [a, b] of [
	[":", "ACAB: All Cops Are Bastards (2012)"],
	["The Smurfs Tw", "The Smurfs 2"],
	["Tw", "American Kickboxer 2"],
	["I, t", "I, The Jury"],
	["One, t", "One, two, three"],
	["One, two, th", "One, two, three"],
	["Batman vs", "Batman v Superman"],
	["Batman vers", "Batman v Superman"],
	["Batman vers", "Batman vs. Two-Face"],
]) {
	if (console && console.assert) {
		console.assert(search_matches_title(a, b), `Search should match.
${show_normalization(a, b)}
(Note: search may do dynamic normalization)
`);
	}
}
const parse_from_location_hash = () => {
	const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
	if (!hash) {
		clear_result();
		return;
	}
	// TODO: should the parenthetical be optional?
	const parsed = parse_title_line(hash);
	if (!parsed) {
		clear_result();
		return;
	}
	const normalized_title = normalize_title(parsed.title);
	const normalized_parenthetical = normalize_title(parsed.parenthetical);
	for (let item_index = 0; item_index < title_line_indexes.length; item_index++) {
		const title_line_index = title_line_indexes[item_index];
		const title_line = unfiltered_title_lines[title_line_index];
		const normalized_title_line = normalized_unfiltered_title_lines[title_line_index];
		if (normalized_title_line.slice(0, normalized_title.length) === normalized_title) { // optimization
			const movie = parse_title_line(title_line);
			if (!movie) {
				console.warn("movie title line didn't parse:", title_line);
			}
			if (
				normalize_title(movie.title) === normalized_title &&
				normalize_title(movie.parenthetical).indexOf(normalized_parenthetical) > -1
			) {
				if (!displayed_title || normalize_title(displayed_title) !== normalized_title) {
					spin_position = item_index;
					spin_velocity = 0;
					ticker_index_attachment = item_index;
					ticker_rotation_deg = 0;
					// animating = false;
					// cancelAnimationFrame(rafid);
					// ticker_rotation_speed_deg_per_frame = 0;
					display_result(title_line);

					render_mega_spinner();
				}
			}
		}
	}
};

const apply_filters = () => {
	const invalidate = () => {
		for (const item_el of item_els) {
			item_el.remove();
		}
		item_els.length = 0;
		// displayed_title = null;
		clear_result();
		render_mega_spinner();
		parse_from_location_hash();
		// spin_position = mod(spin_position, title_line_indexes.length);
		// ticker_index_attachment = mod(ticker_index_attachment, title_line_indexes.length);
		// if (!isFinite(spin_position)) {
		// 	spin_position = 0;
		// }
		// if (!isFinite(ticker_index_attachment)) {
		// 	ticker_index_attachment = 0;
		// }
	};
	title_line_indexes = [...shuffled_unfiltered_title_line_indexes];
	if (title_filter.value === "") {
		invalidate();
		return;
	}
	const search = title_filter.value;
	// const normlized_search = normalize_title(search); // might want something like this as an optimization
	title_line_indexes = title_line_indexes.filter((title_line_index) => {
		const normalized_title_line = normalized_unfiltered_title_lines[title_line_index];
		return search_matches_normalized_title(search, normalized_title_line);
	});
	if (title_line_indexes.length === 0) {
		title_line_indexes = [...shuffled_unfiltered_title_line_indexes];
	}
	invalidate();
};

const main = async () => {
	const response = await fetch("movies.txt");
	// const response = await fetch("test-subtitles.txt");
	const text = await response.text();

	unfiltered_title_lines = text.trim().split(/\r?\n/g);
	normalized_unfiltered_title_lines = unfiltered_title_lines.map(normalize_title);

	title_line_indexes = new Int32Array(unfiltered_title_lines.length);
	for (let i = 0; i < title_line_indexes.length; i++) {
		title_line_indexes[i] = i;
	}
	const prng = sfc32(1, 2, 3, 4);
	shuffle(title_line_indexes, prng);

	shuffled_unfiltered_title_line_indexes = new Int32Array(title_line_indexes);

	spin_position = Math.random() * title_line_indexes.length;
	ticker_index_attachment = spin_position;

	parse_from_location_hash();

	window.addEventListener("hashchange", parse_from_location_hash);

	render_mega_spinner();
	
	window.addEventListener("resize", render_mega_spinner);

	mega_spinner_svg.style.touchAction = "none";
	mega_spinner_svg.style.userSelect = "none";
	mega_spinner_items.style.cursor = "grab";
	mega_spinner_items.addEventListener("selectstart", (event) => {
		event.preventDefault();
	});
	mega_spinner_items.addEventListener("pointerdown", (event) => {
		dragging = true;
		spin_velocity = 0;
		mega_spinner_items.style.cursor = "grabbing";
		const item_height = parseFloat(getComputedStyle(mega_spinner_items).getPropertyValue("--item-height"));
		const start_y = event.clientY;
		const start_spin_position = spin_position;
		let y_velocity_energy = 0;
		let last_event_time = performance.now();
		let last_event_y = start_y;
		const on_pointer_move = (event) => {
			const new_y = event.clientY;
			const new_time = performance.now();
			spin_position = start_spin_position + (new_y - start_y) / item_height;
			if (!animating) {
				animate();
			}
			y_velocity_energy += (new_y - last_event_y) * (new_time - last_event_time) / item_height;
			last_event_time = new_time;
			last_event_y = new_y;
		};
		let iid = setInterval(() => {
			y_velocity_energy *= 0.8;
		});
		const on_pointer_up = (event) => {
			window.removeEventListener("pointermove", on_pointer_move);
			window.removeEventListener("pointerup", on_pointer_up);
			window.removeEventListener("pointercancel", on_pointer_up);
			clearInterval(iid);
			mega_spinner_items.style.cursor = "grab";
			if (event.type !== "pointercancel") {
				spin_velocity = y_velocity_energy / 250;
			}
			dragging = false;
			if (!animating) {
				animate();
			}
		};
		window.addEventListener("pointermove", on_pointer_move);
		window.addEventListener("pointerup", on_pointer_up);
		window.addEventListener("pointercancel", on_pointer_up);
	});

	go_button.onclick = () => {
		spin_velocity = 5 + Math.random() * 5;
		if (!animating) {
			animate();
		}
	};

	window.addEventListener("keydown", (event) => {
		if (event.ctrlKey || event.metaKey && !event.altKey && !event.shiftKey) {
			if (event.key.toUpperCase() === "C") {
				if (
					window.getSelection().isCollapsed && (
						!document.activeElement.matches("textarea, input") ||
						document.activeElement.selectionEnd === document.activeElement.selectionStart
					)
				) {
					event.preventDefault();
					copy_to_clipboard_button.click();
				}
			} else if (event.key.toUpperCase() === "F") {
				event.preventDefault();
				filters.hidden = false;
				title_filter.focus();
				title_filter.select();
			}
		} else if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
			if (event.key === "Escape") {
				filters.hidden = true;
			} else if (event.key === "Enter" || event.key === "Return") {
				if (event.target.closest("#filters")) {
					apply_filters();
				}
			}
		}
	});

	close_filters_button.addEventListener("click", () => {
		filters.hidden = true;
	});

	title_filter.addEventListener("input", apply_filters);

	window.addEventListener("transitionstart", (event) => {
		if (!event.target.matches("#info, #mega-spinner")) {
			return;
		}
		const iid = setInterval(() => {
			fitty.fitAll();
		}, 100);
		const on_transition_end = () => {
			fitty.fitAll();
			clearInterval(iid);
			window.removeEventListener("transitionend", on_transition_end);
		};
		window.addEventListener("transitionend", on_transition_end);
	});

	// TODO: remove duplicate movie listings
	// also look for two vs 2 etc.
	// window.titles = new Map();
	// for (const title_line of unfiltered_title_lines) {
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

	animate();

};

main();
