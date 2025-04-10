document.addEventListener('DOMContentLoaded', () => {
  const roomInput = document.getElementById('roomInput');
  const addRoomBtn = document.getElementById('addRoomBtn');
  const elevator7SortCheckbox = document.getElementById('elevator7Sort');
  const roomList = document.getElementById('roomList');
  const clearListBtn = document.getElementById('clearListBtn');

  // 登録済み部屋番号：キーを部屋番号、値は { elevator, count }
  let registrations = {};

  // エレベーターごとの部屋番号範囲／個別番号の定義
  const elevatorMappings = [
    { 
      elevator: 1, 
      ranges: [ 
        { from: 101, to: 107 }, 
        { from: 201, to: 207 },
        { from: 301, to: 309 },
        { from: 401, to: 409 }, 
        { from: 501, to: 508 }, 
        { from: 601, to: 607 }, 
        { from: 701, to: 706 }, 
        { from: 801, to: 805 }, 
        { from: 901, to: 904 }, 
        { from: 1001, to: 1004 } 
      ] 
    },
    { 
      elevator: 2, 
      ranges: [ 
        { from: 310, to: 312 }, 
        { from: 410, to: 413 }, 
        { from: 509, to: 512 }, 
        { from: 608, to: 611 }, 
        { from: 707, to: 710 }, 
        { from: 806, to: 809 }, 
        { from: 905, to: 908 }, 
        { from: 1005, to: 1008 }, 
        { from: 1101, to: 1104 }, 
        { from: 1201, to: 1203 }, 
        { from: 1301, to: 1303 }, 
        { from: 1401, to: 1401 } 
      ] 
    },
    { 
      elevator: 3, 
      ranges: [ 
        { from: 313, to: 314 }, 
        { from: 414, to: 415 }, 
        { from: 513, to: 514 }, 
        { from: 612, to: 613 }, 
        { from: 711, to: 712 }, 
        { from: 810, to: 811 }, 
        { from: 909, to: 910 }, 
        { from: 1009, to: 1010 }, 
        { from: 1105, to: 1106 }, 
        { from: 1204, to: 1205 }, 
        { from: 1304, to: 1305 }, 
        { from: 1402, to: 1402 } 
      ] 
    },
    { 
      elevator: 4, 
      ranges: [ 
        { from: 315, to: 316 }, 
        { from: 416, to: 417 }, 
        { from: 515, to: 516 }, 
        { from: 614, to: 615 }, 
        { from: 713, to: 714 }, 
        { from: 812, to: 813 }, 
        { from: 911, to: 912 }, 
        { from: 1011, to: 1012 }, 
        { from: 1107, to: 1108 }, 
        { from: 1206, to: 1207 }, 
        { from: 1306, to: 1307 }, 
        { from: 1403, to: 1404 } 
      ] 
    },
    { 
      elevator: 5, 
      ranges: [ 
        { from: 317, to: 320 }, 
        { from: 418, to: 421 }, 
        { from: 517, to: 520 }, 
        { from: 616, to: 619 }, 
        { from: 715, to: 718 }, 
        { from: 814, to: 817 }, 
        { from: 913, to: 916 }, 
        { from: 1013, to: 1016 }, 
        { from: 1109, to: 1112 }, 
        { from: 1208, to: 1211 }, 
        { from: 1308, to: 1310 }, 
        { from: 1405, to: 1405 } 
      ] 
    },
    { 
      elevator: 6, 
      ranges: [ 
        { from: 321, to: 330 }, 
        { from: 422, to: 431 }, 
        { from: 521, to: 530 }, 
        { from: 620, to: 628 }, 
        { from: 719, to: 726 }, 
        { from: 818, to: 824 }, 
        { from: 917, to: 922 } 
      ] 
    },
    { 
      elevator: 7, 
      ranges: [ 
        { from: 208, to: 212 }, 
        { from: 331, to: 335 }, 
        { from: 432, to: 436 }, 
        { from: 531, to: 534 }, 
        { from: 629, to: 631 } 
      ] 
    }
  ];

  // localStorageからデータを読み込む（2日以内の場合のみ有効）
  function loadRegistrations() {
    const cached = localStorage.getItem('granfortableRegistrations');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.timestamp < TWO_DAYS_MS) {
          registrations = parsed.data;
        } else {
          registrations = {};
        }
      } catch (e) {
        console.error("登録データの読み込みエラー", e);
      }
    }
  }

  // localStorageにデータを保存（現在時刻のタイムスタンプ付き）
  function saveRegistrations() {
    const payload = {
      timestamp: Date.now(),
      data: registrations
    };
    localStorage.setItem('granfortableRegistrations', JSON.stringify(payload));
  }

  // 入力された部屋番号に対するエレベーター番号を取得
  function getElevator(roomNum) {
    const num = parseInt(roomNum, 10);
    if (isNaN(num)) return null;
    for (let mapping of elevatorMappings) {
      for (let r of mapping.ranges) {
        if (num >= r.from && num <= r.to) {
          return mapping.elevator;
        }
      }
    }
    return null;
  }

  // 登録済みリストをソートしてDOMに反映する
  function updateList() {
    const items = Object.keys(registrations).map(room => {
      return {
        room: parseInt(room, 10),
        elevator: registrations[room].elevator,
        count: registrations[room].count
      };
    });

    const sortOrder = elevator7SortCheckbox.checked
      ? [1, 7, 2, 3, 4, 5, 6]
      : [1, 2, 3, 4, 5, 6, 7];

    items.sort((a, b) => {
      const orderA = sortOrder.indexOf(a.elevator);
      const orderB = sortOrder.indexOf(b.elevator);
      if (orderA !== orderB) return orderA - orderB;
      return a.room - b.room;
    });

    roomList.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');

      // テキスト部分の作成
      const textSpan = document.createElement('span');
      textSpan.textContent = `部屋番号: ${item.room} (号機: ${item.elevator})${item.count > 1 ? ' ×' + item.count : ''}`;
      li.appendChild(textSpan);

      // ゴミ箱ボタンの作成（テキストの直後に配置）
      const delBtn = document.createElement('button');
      delBtn.className = 'deleteBtn';
      delBtn.textContent = '🗑️';
      delBtn.addEventListener('click', () => {
        const key = item.room.toString();
        if (registrations[key].count > 1) {
          registrations[key].count -= 1;
        } else {
          delete registrations[key];
        }
        updateList();
      });
      li.insertBefore(delBtn, textSpan.nextSibling);

      roomList.appendChild(li);
    });

    saveRegistrations();
  }

  // 入力された部屋番号を登録する
  function addRoom() {
    const roomStr = roomInput.value.trim();
    if (roomStr === '') return;
    if (!/^\d+$/.test(roomStr)) {
      alert('部屋番号は数字のみで入力してください。');
      roomInput.value = '';
      return;
    }
    const elevator = getElevator(roomStr);
    if (elevator === null) {
      alert('入力された部屋番号は存在しません。');
      roomInput.value = '';
      return;
    }
    if (registrations[roomStr]) {
      registrations[roomStr].count += 1;
    } else {
      registrations[roomStr] = { elevator, count: 1 };
    }
    updateList();
    roomInput.value = '';
  }

  clearListBtn.addEventListener('click', () => {
    if (confirm('登録されている全項目を削除しますか？')) {
      registrations = {};
      updateList();
    }
  });

  addRoomBtn.addEventListener('click', addRoom);
  roomInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addRoom();
    }
  });

  elevator7SortCheckbox.addEventListener('change', updateList);

  loadRegistrations();
  updateList();
});
