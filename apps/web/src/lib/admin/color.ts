// <input type="color"> only takes #rrggbb, while links may store #rgb, #rrggbbaa
// or a colour name. Names have no swatch, so they show white until picked.
export function swatchValue(color: string): string {
	if (/^#[0-9a-f]{3}$/i.test(color)) {
		return '#' + [...color.slice(1)].map((c) => c + c).join('');
	}
	if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
		return color.slice(0, 7);
	}
	return '#ffffff';
}

// The CSS named colours, without transparent and currentcolor, which would hide the label.
const NAMES = new Set(
	(
		'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue ' +
		'blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk ' +
		'crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki ' +
		'darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen ' +
		'darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue ' +
		'dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite ' +
		'gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
		'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan ' +
		'lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen ' +
		'lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen ' +
		'magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen ' +
		'mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream ' +
		'mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid ' +
		'palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum ' +
		'powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown ' +
		'seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen ' +
		'steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
	).split(' ')
);

/** A colour a link can be drawn in: #rgb, #rrggbb, #rrggbbaa or a CSS colour name. */
export function isLinkColor(color: string): boolean {
	return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color) || NAMES.has(color.toLowerCase());
}
