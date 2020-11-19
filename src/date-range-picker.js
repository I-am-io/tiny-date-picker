// A date range picker built on top of TinyDatePicker;
import TDP from './index';
import Emitter from './lib/emitter';
import { shiftMonth, datesEq } from './lib/date-manip';
import { cp, noop } from './lib/fns';


export var TinyDatePicker = TDP;

/**
 * The state values for the date range picker
 *
 * @typedef {Object} DateRangeState
 * @property {Date} start - The start date (can be null)
 * @property {Date} end - The end date (can be null)
 */

/**
 * An instance of TinyDatePicker
 *
 * @typedef {Object} DateRangePickerInst
 * @property {DateRangeState} state - The start / end dates
 * @property {function} on - Adds an event handler
 * @property {function} off - Removes an event handler
 * @property {function} setState - Changes the current state of the date picker
 */

/**
 * TinyDatePicker constructs a new date picker for the specified input
 *
 * @param {HTMLElement} input The input associated with the datepicker
 * @returns {DateRangePickerInst}
 */
export function DateRangePicker(container, opts = {}) {
	const emitter = Emitter();
	const root = renderInto(container);
	let hoverDate;
	const state = {
		start: undefined,
		end: undefined,
	};
	// var start = TDP(root.querySelector('.dr-cal-start'), cp({}, opts.startOpts, {
	//   mode: 'dp-permanent',
	//   dateClass: dateClass,
	// }));
	const end = TinyDatePicker(
		root.querySelector('.dr-cal-end'),
		cp({}, opts.endOpts, {
			mode: 'dp-permanent',
			dateClass: dateClass,
		})
	);

	const handlers = {
		statechange: opts.onStateChange || noop,
		select: opts.dateSelected || dateSelected,
	};

	const me = {
		state: state,
		setState: setState,
		on: emitter.on,
		off: emitter.off,
	};

	// start.on(handlers);
	end.on(handlers);

	// function onStateChange(_, dp) {
	//   var d1 = start.state.hilightedDate;
	//   var d2 = end.state.hilightedDate;
	//   var diff = diffMonths(d1, d2);

	//   if (diff === 1) {
	//     return;
	//   }

	//   if (dp === start) {
	//     end.setState({
	//       hilightedDate: shiftMonth(dp.state.hilightedDate, 1),
	//     });
	//   } else {
	//     start.setState({
	//       hilightedDate: shiftMonth(dp.state.hilightedDate, -1),
	//     });
	//   }
	// }

	function dateSelected(_, dp) {
		var dt = dp.state.selectedDate;

		if (!state.start || state.end) {
			setState({
				start: dt,
				end: undefined,
			});
		} else {
			setState({
				start: dt > state.start ? state.start : dt,
				end: dt > state.start ? dt : state.start,
			});
		}
	}

	function setState(newState) {
		for (var key in newState) {
			state[key] = newState[key];
		}

		emitter.emit('statechange', me);
		rerender();
	}

	function rerender() {
		end.setState({});
	}

	// Hack to avoid a situation where iOS requires double-clicking to select
	if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		root.addEventListener('mouseover', function mouseOverDate(e) {
			if (e.target.classList.contains('dp-day')) {
				var dt = new Date(parseInt(e.target.dataset.date));
				var changed = !datesEq(dt, hoverDate);

				if (changed) {
					hoverDate = dt;
					rerender();
				}
			}
		});
	}

	function dateClass(date, dp) {
		console.log(dp);
		var dateClasses = [];
		var rangeClass =
			(state.end || hoverDate) &&
			state.start &&
			inRange(date, state.end || hoverDate, state.start);

		if (hoverDate) {
			dateClasses = dateClasses.concat('dr-hover');
		}

		if (datesEq(date, state.start)) {
			dateClasses = dateClasses.concat('dr-range-start', 'dr-selected');
		}

		if (datesEq(date, state.end)) {
			dateClasses = dateClasses.concat('dr-range-end', 'dr-selected');
		}

		if (rangeClass) {
			dateClasses = dateClasses.concat('dr-in-range');
		}

		return dateClasses.join(' ');
	}

	return me;
}

function renderInto(container) {
	if (typeof container === 'string') {
		container = document.querySelector(container);
	}

	container.innerHTML =
		'<div class="dr-cals">' +
		'<div class="dr-cal-start"></div>' +
		'<div class="dr-cal-end"></div>' +
		'</div>';

	return container.querySelector('.dr-cals');
}

function toMonths(dt) {
	return dt.getYear() * 12 + dt.getMonth();
}

function diffMonths(d1, d2) {
	return toMonths(d2) - toMonths(d1);
}

function inRange(dt, a, b) {
	return Math.min(a, b) <= dt && dt <= Math.max(a, b);
}
