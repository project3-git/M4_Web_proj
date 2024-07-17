document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    setEventListeners();
});

function limitTableRows() {
    const table = document.querySelector('#table-container table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        if (index >= 100) {
            row.style.display = 'none';
        }
    });

    //  3자리 수
    var re = /\B(?=(\d{3})+(?!\d))/g
    var tr_tag = '#table-container tbody tr'

    //  총건수
    var totalLeng = document.getElementById('patents_length').getAttribute('value').replace(re, ",");

    //  3자리 수 콤마
    var currentLeng = rows.length.toString().replace(re, ",");
    
    document.getElementById('patents_h').innerText = '특허 결과 : ' + currentLeng + '/' + totalLeng

    const container = document.querySelector('#table-container');
    container.addEventListener('scroll', () => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight) {

            const invisibleRows = document.querySelectorAll(tr_tag + '[style*="display: none"]');
            invisibleRows.forEach((row, index) => {
                if (index < 100 && row.style.display === 'none') {
                    row.style.display = '';
                }
            });
        }
    });

}

function limitPaperTableRows() {
    const table = document.querySelector('#paper-table-container table');
    if (!table){
      loadingEnd(); 
      return;
    }
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        if (index >= 100) {
            row.style.display = 'none';
        }
    });
    loadingEnd();

    //  3자리 수
    var re = /\B(?=(\d{3})+(?!\d))/g
    var tr_tag = '#paper-table-container tbody tr'

    //  총건수
    var totalLeng = document.getElementById('papapers_length').getAttribute('value').replace(re, ",");

    //  3자리 수 콤마
    var currentLeng = rows.length.toString().replace(re, ",");

    const container = document.querySelector('#paper-table-container');
    container.addEventListener('scroll', () => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
            var invisibleRows = document.querySelectorAll(tr_tag + '[style*="display: none"]');
            invisibleRows.forEach((row, index) => {
                if (index < 100 && row.style.display === 'none') {
                    row.style.display = '';
                }
            });
        }
    });

    document.getElementById('papapers_h').innerText = '논문 결과 : ' + currentLeng + '/' + totalLeng
}

function setEventListeners() {
    limitTableRows();
    limitPaperTableRows();

    document.getElementById('search-form').onsubmit = function(event) {
        loadingStart();
        event.preventDefault();
        var form = event.target;

        fetch(form.action, {
            method: form.method,
            body: new FormData(form),
        }).then(response => {
            if (response.ok) {
                console.log('Search request succeeded');
                return response.text();
            }
            throw new Error('Network response was not ok.');
        }).then(html => {
            console.log('Search response received');
            document.body.innerHTML = html;
            setEventListeners();  // 이벤트 리스너를 다시 설정
            console.log('Tables limited');

        }).catch(error => {
            loadingEnd();
            console.error('There has been a problem with your fetch operation:', error);
        });
    };

    const plotButton = document.getElementById('plot-button');
    if (plotButton) {
        console.log('Plot button found');
        plotButton.addEventListener('click', function() {
            console.log('Plot button clicked');
            window.open('/plot', '_blank', 'width=1600,height=1600');
        });
    } else {
        console.log('Plot button not found');
    }

    // h1 클릭 시 검색 창 초기화
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // 체크박스 상태 초기화
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
                const image = document.getElementById(`${checkbox.id}-image`);
                if (image) {
                    image.classList.remove('checked');
                }
            });

            // 검색 입력 필드 초기화 (만약 검색 필드가 있다면)
            const searchFields = document.querySelectorAll('input[type="text"]');
            searchFields.forEach(field => {
                field.value = '';
            });

            console.log('Search and checkboxes reset');
        });
    } else {
        console.log('Reset button not found');
    }
}

/**
 * 화면 로딩 시작
 */
function loadingStart() {
    const loading = document.querySelector('#loading');
    loading.style.display = 'block';
}

/**
 * 화면 로딩 종료
 */
function loadingEnd() {
    const loading = document.querySelector('#loading');
    loading.style.display = 'none';
}