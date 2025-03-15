function getScript(classNo = 0, hours = 8, minutes = 0, second = 0, millisecond = 0, subMillisecond = 0, r = false, className = '', maxSeat = 4) {
    return `
/**
 * Select seats automatically
 */
 
function getSeatClassByName(classNo, className) {
    let arr = [];
    let allAvailableSeatClasses = document.querySelectorAll("div.single-seat-class.seat-available-wrap.ng-star-inserted");

    if (!className && Number.isInteger(classNo) && classNo > -1) {
        arr.push(allAvailableSeatClasses[classNo]);
        return arr;
    }

    for (const iterator of allAvailableSeatClasses) {
        if (iterator.innerText.match(className)) {
            arr.push(iterator);
        }
    }
    
    if (arr.length > classNo) {
        return new Array(arr[classNo++]);
    }
    else {
        classNo = 0;
    }
    
    return arr;
}

async function getBogies() {
    return await new Promise((resolve, reject) => {
        const bogiesInterval = setInterval(() => {
            var bogieOption = document.querySelector("#select-bogie");
            for (let index = 0; index < 5000; index++) {
                if (bogieOption == null) {
                    bogieOption = document.querySelector("#select-bogie");
                    continue;
                }
                break;
            }
            resolve(bogieOption);
            clearInterval(bogiesInterval);
        }, 500);
    });
};

async function getSeats() {
    return await new Promise((resolve, reject) => {
        const seatsInterval = setInterval(() => {
            var seats = document.querySelectorAll("button.btn-seat.seat-available");
            seats = Array.prototype.slice.call(seats);
            while (seats == null) {
                seats = document.querySelectorAll("button.btn-seat.seat-available");
            }
            seats = seats.filter(seat => !seat.className.match('seat-selected'));
            if (${r} === true) {
               seats.reverse(); 
            }
            resolve(seats);
            clearInterval(seatsInterval);
        }, 500);
    });
};

async function afterGetBogies(bogieOption, bookedSeat, classNo, selectedBogieIndex = -1) {
    if (bogieOption == null) {
        main(classNo, '${className}');
        return;
    }

    return await new Promise((resolve, reject) => {
        let selected = false;
        let availableOptionCount = 0;
        var index = ${r} === true ? bogieOption.length - 1 : 0;
        for (; (${r} === true && index >= 0) || (${r} !== true && index < bogieOption.length); ${r} === true ? index-- : index++) {
            option = bogieOption[index];
            if (option.innerText.split(" - ")[1].match(/[1-9]\\d*/g) && selectedBogieIndex != index) {
                availableOptionCount++;
                if (bogieOption.selectedIndex == index) {
                    selected = true;
                    continue;
                }
                if (selected) {
                    continue;
                }
                bogieOption.selectedIndex = index;
                bogieOption.dispatchEvent(new Event("change"));
                selected = true;
                selectedBogieIndex = index;
            }
        }
        
        if(availableOptionCount < 1) {
            main(++classNo, '${className}');
            return;
        }

        getSeats().then(seats => {
            resolve({
                "seats": seats,
                "bookedSeat": bookedSeat,
                "hasNext": availableOptionCount > 1,
                "selectedBogieIndex": selectedBogieIndex,
                "classNo": classNo
            });
        });
    });
}

async function repeatWork(bogieOption, bookedSeat, classNo, selectedBogieIndex = -1) {
    return await afterGetBogies(bogieOption, bookedSeat, classNo, selectedBogieIndex).then(values => {
        if (values == undefined) {
            return;
        }
        var rememberSeat = ${maxSeat} - values.bookedSeat;
        for (let index = 0; index < values.seats.length && index < rememberSeat; index++) {
            values.seats[index].click();
            values.bookedSeat++;
        }

        if (values.hasNext && values.bookedSeat < ${maxSeat}) {
            repeatWork(bogieOption, values.bookedSeat, values.classNo, values.selectedBogieIndex);
        }
    });
}

async function main(coachNo, coachName) {
    return await new Promise((resolve, reject) => {
        resolve(getSeatClassByName(coachNo, coachName));
    }).then((allSeatClass) => {
        allSeatClass[0].children[1].children[1].children[0].click();
        return getBogies();
    }).then((bogieOption) => {
        repeatWork(bogieOption, 0, coachNo);
    });
}

const startTime = new Date().setHours(${hours},${minutes},${second},${millisecond});

const inter = setInterval(p => {
    if (startTime - ${subMillisecond} <= new Date().getTime()) {
        main(${classNo}, '${className}').then(() => console.log("Mission complete."));
        clearInterval(inter);
    }
});
  `;
}

function getBody(req, classNo = 0, hours = 8, minutes = 0, second = 0, millisecond = 0, subMillisecond = 0, reverse = false, className = '', maxSeat = 4) {
    let dt = new Date();
    return `<textarea style = "width:100%; height: 100%;">
async function booking(data) {
    const script = await (await fetch('https://${req.get('host')}', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
        body: data
    })).text();
    eval(script);
}

// h: hours, m: minutes, s: second, ms: millisecond, sms: subtract ms, r: reverse, cn: className, c: classNo, mx: maxSeat

booking(new URLSearchParams(
    {
        p: ${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()},
        h: ${hours},
        m: ${minutes},
        s: ${second},
        ms: ${millisecond},
        sms: ${subMillisecond},
        r: ${reverse},
        cn: '${className}',
        c: ${classNo},
        mx: ${maxSeat}
    }
)).then(() => console.log('Starting...'));
</textarea>`;
}

module.exports = {
    getBody: getBody,
    getScript: getScript
}
