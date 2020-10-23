
const title_output = document.getElementById("title-output");
const watch_online_link = document.getElementById("watch-online-link");
const result_container = document.getElementById("result");
const go_button = document.getElementById("go");

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
		// "Mermaid's Scar (1993) (OVA)"
		// "Five Children and It (film) (2004)"
		// "Exponát roku 1827 (2008) Czech"
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
	var parenthetical = title_line.slice(open_paren_index+1, -1);
	console.log({title, parenthetical});

	title = title.trim();
	if (title.lastIndexOf(":") === title.length - 1) {
		title = title.slice(0, -1);
	}

	const instances = parenthetical.split(/,\s*/g);

	return {title, parenthetical, instances};
}

const display_result = (title_line)=> {

	window.console && console.log(title_line);
	var {title, parenthetical, instances} = parse_title_line(title_line);
	window.console && console.log({title, parenthetical, instances});

	var instance_index = ~~(Math.random() * instances.length);
	var instance_text = instances[instance_index];

	var display_text = `${title} (${instance_text})`;

	title_output.textContent = display_text;

	watch_online_link.href = "https://google.com/search?q=" + encodeURIComponent(`${display_text} (watch online)`);

	result_container.hidden = false;
};

const main = async ()=> {
	const response = await fetch("movies.txt");
	const text = await response.text();

	const title_lines = text.split(/\r?\n/g);

	go_button.onclick = ()=> {
		const index = Math.floor(Math.random() * title_lines.length);
		const title_line = title_lines[index];

		display_result(title_line);
	};
};

main();
