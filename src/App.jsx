import React, { useState, useEffect } from 'react';


function App() {
  const [contests, setContests] = useState(new Map());
  const [handles, setHandles] = useState(new Set());
  const [conType, setConType] = useState(new Set());

  useEffect(() => {
    updateContests();
  }, []);

  const updateContests = () => {
    fetch('https://codeforces.com/api/contest.list')
      .then(response => response.json())
      .then(data => {
        const newContests = new Map();
        data.result.forEach(contestData => {
          if (contestData.phase === 'FINISHED') {
            newContests.set(contestData.id, contestData.name);
          }
        });
        setContests(newContests);
      });
  };

  const addHandle = () => {
    const handle = document.getElementById('handleInp').value;
    if (handle === '' || handles.has(handle)) return;

    fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
      .then(response => response.json())
      .then(data => {
        const rating = data.result[0].rating;
        const newHandles = new Set(handles);
        newHandles.add(handle);
        setHandles(newHandles);

        // Add handle to Table
        const handleTable = document.getElementById('handleTable');
        const row = handleTable.insertRow(1);
        row.insertCell(0).innerHTML = handle;
        row.insertCell(1).innerHTML = rating;
      });
  };

  const toggleConType = buttonId => {
    const newConType = new Set(conType);
    if (newConType.has(buttonId)) {
      newConType.delete(buttonId);
    } else {
      newConType.add(buttonId);
    }
    setConType(newConType);
  };

  const showContests = () => {
    const attContests = new Set();
    const fetches = [];

    handles.forEach(handle => {
      fetch(`https://codeforces.com/api/user.status?handle=${handle}`)
        .then(response => response.json())
        .then(data => {
          data.result.forEach(contest => {
            if (contest.verdict === 'OK') {
              attContests.add(contest.contestId);
            }
          });
        });
    });

    Promise.all(fetches).then(() => {
      const contestTable = document.getElementById('contestTable');
      while (contestTable.rows.length > 1) {
        contestTable.deleteRow(1);
      }

      contests.forEach((contestName, contestId) => {
        let flag = true;
        conType.forEach(type => {
          if (contestName.indexOf(type) === -1) {
            flag = false;
          }
        });

        if (!attContests.has(contestId) && flag) {
          const row = contestTable.insertRow(-1);
          const cell1 = row.insertCell(0);
          const cell2 = row.insertCell(1);
          cell1.innerHTML = `<a href="https://codeforces.com/contest/${contestId}" target="_blank">${contestName}</a>`;
          cell2.innerHTML = contestId;
        }
      });
    });
  };

  return (
    <div className="ui stackable padded grid" style={{ height: '100vh' }}>
      <div className="seven wide column">
        <div className="ui fluid action big input">
          <input type="text" placeholder="Handle..." id="handleInp" />
          <button className="ui button" onClick={addHandle}>
            Add
          </button>
        </div>

        <div
          style={{
            overflowY: 'scroll',
            display: 'block',
            maxHeight: '85vh',
            marginTop: '2vh',
          }}
        >
          <table className="ui fluid unstackable striped table" id="handleTable">
            <thead>
              <tr>
                <th style={{ width: '75%' }}>Handle</th>
                <th>Rating</th>
              </tr>
            </thead>

            <tbody></tbody>
          </table>
        </div>
      </div>

      <div className="nine wide black column">
        <div className="four ui buttons">
          <button
            className={`ui big inverted button ${conType.has('Div. 1') ? 'active' : ''
              }`}
            id="Div. 1"
            onClick={() => toggleConType('Div. 1')}
          >
            Div 1
          </button>
          <button
            className={`ui big inverted button ${conType.has('Div. 2') ? 'active' : ''
              }`}
            id="Div. 2"
            onClick={() => toggleConType('Div. 2')}
          >
            Div 2
          </button>
          <button
            className={`ui big inverted button ${conType.has('Div. 3') ? 'active' : ''
              }`}
            id="Div. 3"
            onClick={() => toggleConType('Div. 3')}
          >
            Div 3
          </button>
          <button className="ui big inverted button green" onClick={showContests}>
            Show!
          </button>
        </div>
        <div
          style={{
            overflowY: 'scroll',
            display: 'block',
            maxHeight: '85vh',
            marginTop: '2vh',
          }}
        >
          <table className="ui fluid striped table inverted" id="contestTable">
            <thead>
              <tr>
                <th style={{ width: '80%' }}>
                  <b>Name</b>
                </th>
                <th>
                  <b>Id</b>
                </th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
