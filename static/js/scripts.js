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
        if(!validation()) {
            return false;
        }

        //  로딩바
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

    //  영문 입력 방지
    document.getElementById('search_keyword').onkeydown = function(e){
        var val = e.target.value;
        var new_val = val.replace(/[a-zA-Z]/g,'');
        
        e.target.value = new_val;

    };
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

//  유효성체크
function validation(){
    // 검색어 , 카테고리 , 출원일자
    const search_keyword = nvl(document.getElementById('search_keyword').value); //  검색어

    if(search_keyword == ""){
        alert("검색어를 입력해주세요.");
        return false;
    }
    
    //  카테고리 체크박스 체크여부
    const checks = document.getElementsByName('application_fields');
    var check = false;
    for(var i=0; i<checks.length; i++){
        if(checks[i].checked) {
            check = true;
        }
    }

    if(!check){
        alert("카테고리를 선택해주세요.");
        return false;
    }

    //  출원일자
    const start_date = nvl(document.getElementById('start_date').value); //  시작일자
    const end_date  = nvl(document.getElementById('end_date').value); //  종료일자

    if(start_date == "" || end_date == ""){
        alert("출원일자를 입력해주세요.");
        return false;
    }

    //  시작날짜가 종료날짜보다 클 경우
    if(parseInt(start_date.replaceAll('-','')) > parseInt(end_date.replaceAll('-',''))){
        alert("출원일자를 확인해주세요.");
        return false;
    }

    return true;

}

//  null 변환
function nvl(str, defaultStr = ""){
    if(typeof str == "undefined" || str == null || str == "")
        str = defaultStr ;
     
    return str ;
}

function downloadClick() {
    var form = document.getElementById('search-form');

    fetch('/download', {
        method: 'POST',
        body: new FormData(form),
    }).then(response => {
        if (response.ok) {
            return response.blob();
        } else {
            throw new Error('Network response was not ok.');
        }
    }).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'filtered_data.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}
