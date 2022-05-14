let ModeApp = ''

let db = null

let config = {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: false,
    allowTouchMove: false
}

var swiper = new Swiper('.swiper-container', config);

const swiperContainer = document.querySelector('.swiper-container').swiper;

const IDB = (function init() {
    let objectStore = null
    let DBOpenReq = indexedDB.open('notebook-db', 1)

    DBOpenReq.addEventListener('error', (err) => {
        console.warn(err)
    })
    DBOpenReq.addEventListener('success', (e) => {
        db = e.target.result
        console.log('Success ', db)
        listUInote()
    })
    DBOpenReq.addEventListener('upgradeneeded', (e) => {
        db = e.target.result
        console.log('upgrad ', db)
        if (!db.objectStoreNames.contains('noteStore')) {
            objectStore = db.createObjectStore('noteStore', {
                keyPath: 'id'
            })
        }
    })
})()


moment.locale('fr', {
    months: 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
    monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
    monthsParseExact: true,
    weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
    weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
    weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
    weekdaysParseExact: true,
    longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd D MMMM YYYY HH:mm'
    },
    calendar: {
        sameDay: '[Aujourd’hui à] LT',
        nextDay: '[Demain à] LT',
        nextWeek: 'dddd [à] LT',
        lastDay: '[Hier à] LT',
        lastWeek: 'dddd [dernier à] LT',
        sameElse: 'L'
    },
    relativeTime: {
        future: 'dans %s',
        past: 'il y a %s',
        s: 'quelques secondes',
        m: 'une minute',
        mm: '%d minutes',
        h: 'une heure',
        hh: '%d heures',
        d: 'un jour',
        dd: '%d jours',
        M: 'un mois',
        MM: '%d mois',
        y: 'un an',
        yy: '%d ans'
    },
    dayOfMonthOrdinalParse: /\d{1,2}(er|e)/,
    ordinal: function (number) {
        return number + (number === 1 ? 'er' : 'e');
    },
    meridiemParse: /PD|MD/,
    isPM: function (input) {
        return input.charAt(0) === 'M';
    },
    meridiem: function (hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
    },
    week: {
        dow: 1,
        doy: 4
    }
});

const EventNote = () => {
    document.querySelectorAll('.note').
    forEach(layoutNote => {
        layoutNote.addEventListener('click', (e) => {
            if (e.path[1].classList.contains('note')) {
                document.querySelector('.note-title').value = e.path[1].getAttribute('note-title')
                document.querySelector('#memo').value = e.path[1].getAttribute('content-note')
            } else {
                document.querySelector('.note-title').value = e.path[0].getAttribute('note-title')
                document.querySelector('#memo').value = e.path[0].getAttribute('content-note')
            }
            document.querySelector('.btn-save').innerHTML = 'Enregistrer'
            ModeApp = "read-mode"
            swiperContainer.slideNext();

        })
    })
}
const listUInote = () => {
    let tx = db.transaction('noteStore', 'readonly');
    let recordNote = tx.objectStore('noteStore');
    let getRequest = recordNote.getAll();
    getRequest.onsuccess = (e) => {
        document.querySelector('.container__note')
            .innerHTML = '';
        console.log(e.target.result.reverse())
        e.target.result.reverse().forEach(data => {
            document.querySelector('.container__note')
                .innerHTML += `
  <div class="note ${SetColorBg()}" note-id="${data.id}" note-title="${data.title}" content-note="${data.content}" note-date="${data.created}">
    <p class="note__title">
        ${data.title}
    </p>
    <span class="note__date" note-date="${data.created}">${data.created}</span>
  </div>

  `
        })
        EventNote()
    }
}


async function addNote() {
    let idNode = 0;
    (function generateUniqueID() {
        let tx = db.transaction('noteStore', 'readonly');
        let recordNote = tx.objectStore('noteStore');
        let getRequest = recordNote.getAll();
        getRequest.onsuccess = (e) => {
            console.log(e.target.result.length)
            idNode = e.target.result.length + 1
        }
    })()
    setTimeout(() => {
        let note = {
            id: idNode,
            title: document.querySelector('.note-title').value,
            content: document.querySelector('#memo').value,
            created: moment().format('LLLL')
        }
        let tx = db.transaction('noteStore', 'readwrite');
        tx.oncomplete = (e) => {
            console.log(e)
        }
        tx.onerror = (err) => {
            console.warn(err)
        }
        let store = tx.objectStore('noteStore')
        let requestAdd = store.add(note)
        requestAdd.onsuccess = (e) => {
            console.log('note créer avec succès !! ', e)
            listUInote()
        }
        requestAdd.onerror = (err) => {
            console.warn(err)
        }
    }, 100)


}

const sliderMenu = () => {
    let btnprev = document.querySelector(".btn-back"),
        btnnext = document.querySelector(".btn-add")
    btnprev.addEventListener('click', () => {
        swiperContainer.slidePrev();
    })
    btnnext.addEventListener('click', () => {
        document.querySelector('.note-title').value = ''
        document.querySelector('#memo').value = ''
        document.querySelector('.btn-save').innerHTML = 'Enregistrer'
        ModeApp = "append-note"
        swiperContainer.slideNext();
    })
    document.querySelector('.btn-save')
        .addEventListener('click', () => {
            if (ModeApp === "append-note") {
                addNote()
                swiperContainer.slidePrev();
            } else {

                //updateNote(document.querySelector('.note-title').value, document.querySelector('#memo').value)
            }
        })
}

const SetColorBg = () => {
    if (document.querySelectorAll('.note').length === 0) {
        return 'clr__default'
    } else {
        let lastChild = document.querySelectorAll('.note')[document.querySelectorAll('.note').length - 1]
        if (lastChild.classList.contains('clr__purple')) {
            return 'clr__default'
        } else if (lastChild.classList.contains('clr__default')) {
            return 'clr__yellow'
        } else if (lastChild.classList.contains('clr__yellow')) {
            return 'clr__green'
        } else if (lastChild.classList.contains('clr__green')) {
            return 'clr__violet'
        } else if (lastChild.classList.contains('clr__violet')) {
            return 'clr__red'
        } else {
            return 'clr__purple'
        }
    }
}

window.addEventListener('load', () => {
    sliderMenu()

})
