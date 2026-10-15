(()=>{
 let dialog,config,index=0,furthest=0,returnFocus,endingMode='summary',activeVideo;
 const D=window.MihaejeAdventureData;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
 const button=(text,fn,cls='')=>{const b=el('button',cls,text);b.type='button';b.onclick=fn;return b};
 // Four consecutive photographs. Detailed deductions are only rendered at the last beat.
 const stories={
  "garage": {
    "titles": [
      "폐업 전날의 정비소",
      "고객에게 건넬 조사 기록",
      "카드를 꺼낸 사람"
    ],
    "prose": [
      "고객이 맡긴 카드는 보관함에서 사라졌습니다. 남은 영상과 직원 기록으로 그날 밤의 순서를 확인했습니다.",
      "점검 영수증과 출입 기록, 보관함 백업을 봉투에 넣습니다. 고객이 나중에도 확인할 수 있게 조사 내용을 함께 남깁니다.",
      "같은 재킷과 서로 다른 시계 때문에 알아보기 어려웠던 방문자가 기록에 남아 있습니다."
    ],
    "reasons": [
      [
        "영상의 실제 시각",
        "블랙박스는 서버보다 7분 빨랐습니다. 영상의 21:53:20은 실제 21:46:20입니다.",
        "점검 영수증 · 블랙박스 영상"
      ],
      [
        "보관함이 열린 순간",
        "07번 카드는 한지수의 것입니다. 지수가 들어온 뒤 21:47:05에 보관함이 열렸고, 21:47:10에 카드가 꺼내졌습니다. 강민호와 윤서연은 같은 시각 다른 장소의 영상에 찍혔습니다.",
        "직원 명부 · 출입 기록 · 보관함 백업"
      ],
      [
        "사진을 숨기려던 이유",
        "폐업 메모에는 고객 동의 없이 교체한 부품의 사진이 카드에 남아 있다고 적혀 있습니다. 조사 기록은 고객에게 전달했고, 사라진 카드 자체는 아직 되찾지 못했습니다.",
        "폐업 인계 문서 · 고객 인계 기록"
      ]
    ],
    "choices": [
      "고객에게 조사 기록을 건넵니다. 고객은 사진이 사라졌더라도 무슨 일이 있었는지 확인할 자료가 남았다며 봉투를 받습니다.",
      "인계철에 조사 기록을 보관합니다. 고객에게는 원본을 건네고, 보관하기로 한 종이 사본을 따로 챙깁니다."
    ]
  },
  "apartment": {
    "titles": [
      "불빛이 찍힌 빈 건물",
      "관리인의 마지막 점검",
      "조용해진 502호"
    ],
    "prose": [
      "이웃들이 404호라고 부르던 창은 실제로 다른 집이었습니다. 제보 사진과 도면에서 위치를 확인했습니다.",
      "관리인이 점검함에서 배터리를 분리합니다. 철거 전에 해둔 조명 점검이 끝났습니다.",
      "빈방의 창문이 조용해졌습니다. 관리인은 그날의 설치 기록을 점검 공책에 끼워 넣습니다."
    ],
    "reasons": [
      [
        "실제로 불이 켜진 집",
        "1층은 주차장이라 첫 창문 줄이 2층입니다. 네 번째 창문 줄은 5층이고, 뒤편에서 본 세 번째 집은 02호입니다. 불빛은 502호에서 켜졌습니다.",
        "불빛을 찍은 필름 · 건물 배치도"
      ],
      [
        "점검함의 숫자",
        "502호의 뒤편 창은 작은방·거실·안방 순서입니다. 필름의 작은방·안방·거실·작은방을 공책의 숫자로 읽으면 3123입니다.",
        "관리인의 점검 공책 · 필름 · 평면도"
      ],
      [
        "전원이 끊겼는데 켜진 이유",
        "관리인은 낮에 독립 배터리와 예약 장치를 설치했습니다. 건물 전원을 끊어도 배터리로 조명을 차례로 켤 수 있었습니다. 밤에 사람이 들어온 기록은 없었습니다.",
        "철거 전 점검 일지 · 점검함 설치 기록"
      ]
    ],
    "choices": [
      "관리인이 배터리를 분리하고 덮개를 닫습니다. 마지막 점검을 마친 뒤 건물 밖으로 나옵니다.",
      "제보 사진과 설치 기록을 함께 보관합니다. 오래된 소문 대신 그날 확인한 내용을 기록으로 남깁니다."
    ]
  },
  "radio": {
    "titles": [
      "새벽에 다시 들린 방송",
      "남아 있던 점검 예약",
      "녹음을 보관함에 넣으며"
    ],
    "prose": [
      "기사가 들은 방송을 녹음 조각으로 복원했습니다. 들린 날과 녹음한 날은 달랐습니다.",
      "담당자는 중계소의 점검 예약을 지우고 테스트 송출 연결을 분리합니다.",
      "원본 녹음은 보관함에 넣습니다. 담당자는 다음 점검자가 알아볼 수 있게 재실행된 경위를 라벨에 적습니다."
    ],
    "reasons": [
      [
        "복원한 방송",
        "A·B·C·D는 START→J03→J08→J17→END로 이어집니다. E는 다른 버전이라 J09 뒤에 이어질 조각이 없습니다.",
        "보관 녹음 · 편집자의 표식표"
      ],
      [
        "녹음 날짜와 재생 경로",
        "방송은 2023년 4월 12일 녹음입니다. 스튜디오의 마이크는 쓰이지 않았고, 별도 전원이 남은 중계소에서 같은 보관 파일이 재생됐습니다.",
        "녹음 라벨 · 전원 점검표 · 파일 비교 기록"
      ],
      [
        "왜 다시 방송됐을까",
        "설비를 복구하면서 멈춰둔 점검 예약이 다시 실행됐습니다. 담당자가 지우지 않은 오래된 녹음 파일이 그 예약에 들어 있었습니다.",
        "마지막 송출 기록"
      ]
    ],
    "choices": [
      "테스트 송출 연결을 분리합니다. 담당자는 다음 점검 때도 같은 예약이 남지 않도록 일지에 표시합니다.",
      "녹음 날짜와 다시 재생된 경위를 보관 라벨에 적습니다. 원본 녹음은 보관함에 돌려놓습니다."
    ]
  },
  "station": {
    "titles": [
      "사진 속 낡은 승강장 표지",
      "수림역에서 찾은 연락처",
      "민서의 목소리를 듣고"
    ],
    "prose": [
      "민서가 찍은 표지는 개편 전 3번 승강장이었습니다. 지금의 번호와 방향을 찾아 이용 내역을 따라왔습니다.",
      "수림역 보관함에서 안내소 연락처를 찾았습니다. 안내소 담당자가 민서를 불러 통화를 연결합니다.",
      "민서가 괜찮다는 말을 직접 들었습니다. 친구는 왜 연락이 없었는지 듣고 나서 걱정을 놓습니다."
    ],
    "reasons": [
      [
        "민서가 탄 길",
        "옛 3번은 현재 2번, 북쪽 방향입니다. 미루→중앙→북문→수림은 13분, 800원으로 이용 내역과 맞습니다.",
        "승강장 개편 안내 · 구간 운행표 · 공유한 이용 내역"
      ],
      [
        "도착 기록이 없던 이유",
        "수림역에는 하차 단말기가 없습니다. 역코드 24와 예약 칸 3을 붙인 243으로 보관함을 열어 안내소 연락처를 찾았습니다.",
        "이용 내역 · 사물함 예약표"
      ],
      [
        "연락이 늦어진 이유",
        "민서는 신청한 기록 봉사 일정에 참여하고 있었습니다. 일정 안내를 써두고 보내기 버튼을 누르지 않았고, 휴대폰을 충전해 둔 채 자료를 정리하느라 연락을 보지 못했다고 했습니다.",
        "안내소에서 연결한 민서와의 통화"
      ]
    ],
    "choices": [
      "이용 내역과 통화 기록을 함께 넣습니다. 마지막 사진에는 낡은 표지가 찍혔지만 민서가 탄 길은 지금도 이어져 있었습니다.",
      "친구에게 민서와 연락이 닿았다고 전합니다. 수림역 안내소에서 확인한 이야기를 기록에 남깁니다."
    ]
  },
  "laundry": {
    "titles": [
      "받지 못한 코트의 영수증",
      "서경에게 돌아온 코트",
      "잘못 남은 수령 표시"
    ],
    "prose": [
      "영수증의 날짜와 서경이 기억한 밤이 달랐습니다. 접수번호와 시계 차이로 실제 순서를 찾았습니다.",
      "운영자의 창고에서 N-08 꼬리표가 붙은 코트를 찾았습니다. 서경은 코트의 주머니와 단추를 확인합니다.",
      "실제로 전달한 시각을 수령표에 남깁니다. 서경이 코트를 챙긴 뒤 세탁소의 마지막 불을 끕니다."
    ],
    "reasons": [
      [
        "영수증의 실제 날짜",
        "단말은 서버보다 12분 빨랐습니다. 10월 10일 00:08은 실제 10월 9일 23:56입니다. N-08 코트는 2번 보관 기계에 있었습니다.",
        "코트 접수표 · 시계 점검 스티커 · 영수증"
      ],
      [
        "코트가 꺼내진 때",
        "실제 23:56:05에 보관함이 열렸고 23:56:14에 코트가 꺼내졌습니다. 서경이 들어온 시각은 23:58입니다. 코트가 꺼내질 때 안에 있던 사람은 운영자 서도윤뿐이었습니다.",
        "직원 출입 명부 · 수령 원장"
      ],
      [
        "고객 수령이라고 남은 이유",
        "서도윤이 코트를 꺼낸 뒤 고객 수령 항목을 직접 눌렀습니다. 서경에게 전달하지 않았는데도 영수증에는 받은 것으로 남은 것입니다. 코트는 서도윤의 창고에서 발견됐습니다.",
        "수령 원장 · 서경의 문의"
      ]
    ],
    "choices": [
      "서경에게 코트를 건넵니다. 잘못 남긴 수령 표시를 바로잡고, 실제로 받은 시각을 함께 적습니다.",
      "영수증과 출입 기록을 함께 보관합니다. 서경이 코트를 받지 않았다는 말은 두 기록을 비교하고 나서 확인됐습니다."
    ]
  },
  "letter": {
    "titles": [
      "옛 주소로 돌아온 봉투",
      "사서가 남긴 분류 메모",
      "봉투가 돌아갈 서가"
    ],
    "prose": [
      "옛 주소로 보낸 봉투들이 발신함으로 돌아왔습니다. 주소 변경 공고에서 새 기록관 주소를 찾았습니다.",
      "우체국 날짜 도장 순서로 놓으니 뒷면 표식이 이어졌습니다. 사서의 메모대로 서가 위치를 읽습니다.",
      "정해린은 새 주소 쪽지를 각 봉투에 끼워 넣습니다. 정리한 서류를 서가에 놓고 보낸 사람들에게 연락합니다."
    ],
    "reasons": [
      [
        "봉투가 돌아온 이유",
        "미루동 17-4의 기록관은 미루기록길 12로 옮겼습니다. 옛 주소로 보낸 봉투가 주소 불명으로 발신함에 돌아왔습니다.",
        "봉투 겉면 · 주소 변경 공고"
      ],
      [
        "봉투를 보낸 순서",
        "날짜 도장은 9월 19일, 23일, 27일, 10월 1일 순입니다. 뒷면의 M·R·17·04를 같은 순서로 읽으면 MR열 17단 04칸입니다.",
        "봉투 앞뒤 · 사서의 분류 메모"
      ],
      [
        "서류를 받아둔 사람",
        "사서 정해린이 돌아온 종이 사본들을 새 보존서고에 받아두었습니다. 인수 기록에는 보낸 사람과 보관 위치가 함께 적혀 있습니다.",
        "사서의 인수 기록"
      ]
    ],
    "choices": [
      "반송 이유와 새 주소를 적어 봉투에 끼웁니다. 다음에 보내는 사람이 옛 주소를 다시 쓰지 않게 합니다.",
      "봉투들을 지정된 서가에 돌려놓습니다. 정해린은 서류를 잘 받았다는 연락을 보낸 사람들에게 남깁니다."
    ]
  },
  "pet-home": {
    "titles": [
      "정우가 건넨 기념품 상자",
      "루미가 지낸 곳을 따라",
      "유나와 루미의 옛 사진"
    ],
    "prose": [
      "유나가 루미를 입양한 뒤 정우에게 상자를 받았습니다. 담요와 파란 끈, 진료 봉투에 예전 날짜가 남아 있습니다.",
      "기념품의 날짜를 보호센터 기록과 맞춰봅니다. 병원과 임시보호집을 거쳐 정우의 집에 온 순서가 이어집니다.",
      "옛 사진에는 어린 유나와 콩이가 함께 있습니다. 유나는 지금의 루미가 그 강아지였다는 것을 알게 됩니다."
    ],
    "reasons": [
      [
        "기념품이 남은 날",
        "파란 끈은 7월 16일 발견한 날, 진료 봉투는 17일 치료받은 날, 담요는 18일 임시보호집에 간 날의 것입니다. 8월 2일에는 정우의 가족이 됐습니다.",
        "루미의 기념품 · 보호센터의 돌봄 기록"
      ],
      [
        "콩이와 루미",
        "접수 27번에서 진료 V-6384로, 진료 서류에서 등록번호 941372608154902로 이어집니다. 지금의 입양 서류에도 같은 등록번호가 남았습니다. 콩이는 루미의 예전 이름입니다.",
        "루미의 진료·입양 기록"
      ],
      [
        "그날 강아지를 데려온 아이",
        "사진의 날짜와 정류장, 학교 명찰 끈이 발견 기록과 맞습니다. 정우의 편지와 원본 신고서에서 당시 어머니와 함께 온 아이가 김유나였다는 것을 확인했습니다.",
        "유나의 사진첩 · 파란 끈 · 정우가 남긴 편지"
      ]
    ],
    "choices": [
      "유나는 루미가 쉴 자리에 오래된 담요를 펼칩니다. 루미는 담요 냄새를 맡고 그 위에 눕습니다.",
      "유나의 옛 사진 옆에 오늘 찍을 사진 자리를 남깁니다. 정우와 함께 산책하는 날 새 사진을 넣기로 합니다."
    ]
  },
  "cat-invite": {
    "titles": [
      "봄이 앞으로 온 선물",
      "리본 안에 끼운 쪽지",
      "다은을 기다리던 빈 의자"
    ],
    "prose": [
      "다은은 봄이를 위한 모임인 줄 알고 선물을 정리했습니다. 이웃들의 쪽지에는 앉고 싶은 자리와 고마운 말이 적혀 있습니다.",
      "각 선물의 리본을 풀어 이웃들이 함께 봄이를 돌보던 이야기를 읽었습니다. 감사 카드에 날짜가 남아 있습니다.",
      "이틀 뒤 모임 날, 다은이 가게 문을 엽니다. 마지막 초대장의 받는 사람 칸을 보고 웃자 이웃들이 이름을 부릅니다."
    ],
    "reasons": [
      [
        "모임에 오는 이웃",
        "은호, 소연, 지후, 미정이 선물을 보냈습니다. 준호의 흰 포장은 가게에 배송한 물품입니다.",
        "선물 이름표 · 이웃들의 쪽지"
      ],
      [
        "이웃들의 자리와 쪽지",
        "창가부터 시계 방향으로 은호, 소연, 지후, 미정이 앉습니다. 각 선물 안에는 함께 봄이를 돌보던 때를 기억하는 쪽지가 들어 있었습니다.",
        "포장 가게의 자리표 · 리본 안의 쪽지"
      ],
      [
        "축하하려던 날",
        "작년 6월 12일에 돌봄 당번이 끝나고 다은이 입양 서류에 서명했습니다. 올해 같은 날은 이틀 뒤입니다. 이웃들은 봄이의 생일 대신 다은과 봄이가 가족이 된 날을 함께 축하하려고 했습니다.",
        "봄이의 돌봄 달력 · 감사 카드 · 마지막 초대장"
      ]
    ],
    "choices": [
      "다은의 빈 의자에 초대장을 세워두었습니다. 이틀 뒤 모임 날, 봄이가 리본을 건드리는 사이 이웃들이 들어와 다은을 부릅니다.",
      "다은에게 마지막 봉투를 건넵니다. 고양이 앞으로 온 줄 알았던 초대장에 자기 이름이 적혀 있습니다."
    ]
  },
  "studio": {
    "titles": [
      "스무 해 전에 맡긴 필름",
      "윤서와 할아버지가 돌아온 날",
      "사진관 벽에 걸린 사장님 사진"
    ],
    "prose": [
      "2006년 3월의 봉투에는 인화를 함께 하자는 윤서의 말이 남아 있었습니다. 손주는 봉투에서 필름의 보관 칸을 찾았습니다.",
      "손주가 확대기를 준비하자 두 사람이 돌아왔습니다. 셋은 붉은 안전등 아래에서 인화를 마쳤습니다.",
      "벽에 새로 걸린 사진에는 늘 카메라 뒤에 있던 할아버지가 찍혀 있습니다. 윤서가 그 사진 앞에 함께 섭니다."
    ],
    "reasons": [
      [
        "필름을 찾고 준비한 과정",
        "봉투를 기울여 C3 글씨를 읽고 필름을 찾았습니다. 번호 순서와 앞뒤를 맞춘 뒤 23번 컷을 골랐습니다. 인화지 8×10, 초점 60~70, 노출 12초로 준비했습니다.",
        "오래된 봉투 · 필름 봉투 · 전시 액자"
      ],
      [
        "사진 속 인물과 촬영자",
        "사진 속 초승달 앞치마는 할아버지의 것입니다. 윤서가 남긴 「이번엔 제가 찍을게요」와 사진 뒷면의 「사장님 사진 1호」가 촬영자와 인물을 구별해 줍니다.",
        "작품의 벽 · 인화한 사진 · 사진 뒷면"
      ],
      [
        "함께 마친 인화",
        "윤서가 해외로 떠난 뒤 인화는 미뤄졌습니다. 오늘 돌아온 윤서와 할아버지가 손주와 함께 노출, 현상, 정지, 정착을 마쳤습니다. 사진 뒷면에는 촬영한 날과 오늘 인화한 날을 따로 적었습니다.",
        "할아버지의 부탁 · 인화 공정표 · 사진 뒷면"
      ]
    ],
    "choices": [
      "할아버지의 사진을 벽에 겁니다. 윤서는 사진 속 앞치마를 가리키며 자기가 수선한 초승달이 아직 남아 있다고 웃습니다.",
      "사진 뒷면에 함께 인화한 오늘의 날짜를 적습니다. 촬영 날짜 아래에 스무 해 만에 두 번째 날짜가 생겼습니다."
    ]
  },
  "ohang": {
    "titles": [
      "오늘 적은 접수표",
      "관리인이 보관한 접수표",
      "앞으로의 나에게 남기는 말"
    ],
    "prose": [
      "접수표에 맡기고 싶은 말을 골랐습니다. 먹지를 끼워 쓴 글은 아래 종이에도 남았습니다.",
      "그릇과 등불을 돌아본 뒤 관리인이 보관한 접수표를 받았습니다. 처음 적은 문장과 물건이 그대로 남아 있습니다.",
      "접힌 받는 사람 칸에는 「다음의 나에게」라고 적혀 있습니다. 마지막으로 챙긴 물건과 함께 편지를 접습니다."
    ],
    "reasons": [
      [
        "그릇과 방향표",
        "접수표의 시작 빛에서 목·화·토·금·수의 고리를 이었습니다. 방향표에는 북 수, 동 목, 남 화, 서 금, 가운데 토가 적혀 있습니다.",
        "접수표 · 관계표 · 방향표"
      ],
      [
        "같은 글씨가 남은 이유",
        "처음 접수표 두 장 사이에 먹지를 끼워 썼습니다. 관리인은 위의 접수표를 보관했고, 당신은 먹지로 옮긴 아래 사본을 받았습니다. 돌아와 읽은 글은 처음 내가 고른 문장입니다.",
        "관리인이 보관한 접수표 · 가지고 있던 먹지 사본"
      ],
      [
        "편지를 읽을 사람",
        "받는 사람은 앞으로의 나입니다. 생일로 정한 시작 빛과 별개로, 맡길 문장과 챙길 물건은 내가 골랐습니다.",
        "받는 사람 칸 · 처음 고른 문장 · 마지막 물건"
      ]
    ],
    "choices": [
      "오늘 적은 말을 앞으로의 내가 읽을 봉투에 넣습니다. 마지막으로 고른 물건을 챙겨 정원으로 나갑니다.",
      "관리인이 봉투를 건넵니다. 다음에 다시 와도 괜찮다는 말을 듣고 오늘 고른 물건을 쥡니다."
    ]
  }
};
 const captions=['문 앞에서','손에 남은 것','방을 돌아보며','당신이 남긴 것'];
 const altScene=['사건 장소의 외관','결말의 물건을 담은 근접 사진','사건 장소의 실내','문을 나선 뒤의 마지막 풍경'];
 function photographs(id){return [
  {src:'assets/covers/'+id+'-960-v2.webp',small:'assets/covers/'+id+'-480-v2.webp',width:960,height:640},
  {src:'assets/endings/'+id+'-detail-v36.webp',small:'assets/endings/'+id+'-detail-480-v36.webp',width:960,height:640},
  {src:'assets/photoreal/'+(id==='studio'?'studio-room-v1':id+(id==='ohang'?'-inner-v2':'-inner-v37'))+'.webp',width:1536,height:1024},
  {src:'assets/endings/'+id+'-v35.webp',small:'assets/endings/'+id+'-480-v35.webp',width:960,height:['pet-home','cat-invite','ohang'].includes(id)?540:640}
 ]}
 function stopVideo(){if(!activeVideo)return;activeVideo.pause();activeVideo.removeAttribute('src');activeVideo.load();activeVideo=null}
 function close(){if(!dialog?.open)return;stopVideo();dialog.close();if(returnFocus?.isConnected!==false)returnFocus?.focus({preventScroll:true})}
 function garageRecord(copy){
  const details=el('details','ending-film-explanation');details.append(el('summary','','사건 풀이 읽기 · 기록과 근거'));
  stories.garage.reasons.forEach(([title,text,source])=>{const card=el('section','ending-film-reason');card.append(el('h3','',title),el('p','',text),el('p','ending-film-evidence','근거 · '+source));details.append(card)});
  copy.append(details);
 }
 function renderGarage(){
  stopVideo();dialog.replaceChildren();dialog.dataset.theme=D.garage.skin;dialog.dataset.mode=endingMode;dialog.dataset.beat='ending';
  const top=el('div','ending-film-top');top.append(el('span','','미해제 · 마지막 정비소'),button('닫기',close));dialog.append(top);
  const choice=config.state.sceneEnding?.choice===1?1:0;
  if(endingMode==='video'){
   const stage=el('section','ending-video-stage'),heading=el('h2','','정비소에 찾아온 아침');heading.id='endingSceneTitle';heading.tabIndex=-1;
   const video=el('video','ending-video-player');video.controls=true;video.playsInline=true;video.preload='none';video.poster='assets/endings/garage-v35.webp';video.setAttribute('aria-label','정비소에 찾아온 아침 · 엔딩 영상');video.src='/media/assets/endings/garage-film-v42.mp4';video.volume=.6;activeVideo=video;
   const status=el('p','ending-video-status','영상을 불러오고 있습니다');status.setAttribute('role','status');
   video.addEventListener('playing',()=>{status.textContent=''});
   video.addEventListener('ended',()=>{status.textContent='확인한 이야기는 기록으로 남습니다';config.state.sceneEnding={...(config.state.sceneEnding||{}),videoSeen:true};config.save?.()});
   video.addEventListener('error',()=>{status.textContent='영상을 불러오지 못했습니다. 다시 재생하거나 사건 풀이를 읽어주세요'});
   const actions=el('div','ending-film-actions');actions.append(button('다시 재생',()=>{video.currentTime=0;video.play().catch(()=>{status.textContent='영상의 재생 버튼을 눌러주세요'})}),button('사건 풀이로 돌아가기',()=>{endingMode='summary';render();dialog.querySelector('h2').focus({preventScroll:true})},'film-primary'));
   stage.append(heading,video,status,actions);dialog.append(stage);
   video.play().catch(()=>{if(activeVideo===video)status.textContent='영상의 재생 버튼을 눌러주세요'});return;
  }
  const image=el('img','ending-film-image');image.src='assets/endings/garage-v35.webp';image.srcset='assets/endings/garage-480-v35.webp 480w, assets/endings/garage-v35.webp 960w';image.sizes='100vw';image.alt='새벽 정비소 작업대에 놓인 인계 봉투';image.width=960;image.height=640;dialog.append(image,el('div','ending-film-shade'));
  const copy=el('section','ending-film-copy'),heading=el('h2','',config.finalBeat??['확인한 기록을 인계 봉투에 남깁니다','원본과 동의받은 종이 사본을 나눕니다'][choice]);heading.id='endingSceneTitle';heading.tabIndex=-1;
  copy.append(el('p','ending-film-caption','이야기의 끝'),heading,el('p','ending-film-story',stories.garage.choices[choice]));
  const actions=el('div','ending-film-actions');actions.append(button('엔딩 영상 보기',()=>{endingMode='video';render();dialog.querySelector('h2').focus({preventScroll:true})},'film-primary'));copy.append(actions);garageRecord(copy);
  const hook=el('div','ending-film-hook');hook.hidden=!config.state.sceneEnding?.hookSeen;hook.id='endingSceneHook';hook.tabIndex=-1;hook.append(el('p','',D.garage.hook));
  const reveal=button('남겨진 흔적 살펴보기',()=>{hook.hidden=false;reveal.hidden=true;config.state.sceneEnding={...(config.state.sceneEnding||{}),hookSeen:true};config.save?.();hook.focus({preventScroll:true})});reveal.hidden=!hook.hidden;copy.append(reveal,hook);
  const footer=el('div','ending-film-actions');if(config.detail)footer.append(button('발견한 이야기 다시 읽기',()=>{close();config.detail()},'film-secondary'));
  recommendation(copy);const home=el('a','film-primary','테마 로비로 →');home.href='index.html#cases';footer.append(home);copy.append(footer);dialog.append(copy);
 }
 function move(next){index=Math.max(0,Math.min(3,next));furthest=Math.max(furthest,index);render();dialog.querySelector('h2').focus({preventScroll:true})}
 function render(){
  if(config.id==='garage'){renderGarage();return}
  delete dialog.dataset.mode;
  const t=D[config.id],story=stories[config.id],choice=config.state.sceneEnding?.choice===1?1:0;
  const custom=config.beats||story.titles,beats=[...Array.from({length:3},(_,i)=>custom[i]??story.titles[i]),config.finalBeat??t.choiceBeats[choice]];
  const last=index===3,photo=photographs(config.id)[index];
  dialog.replaceChildren();dialog.dataset.theme=t.skin;dialog.dataset.beat=String(index+1);
  const image=el('img','ending-film-image');image.src=photo.src;
  if(photo.small)image.srcset=photo.small+' 480w, '+photo.src+' 960w';
  image.sizes='100vw';image.alt=t.reward+' · '+altScene[index]+' · 가상 재현';image.width=photo.width;image.height=photo.height;image.decoding='async';
  dialog.append(image,el('div','ending-film-shade'));
  const top=el('div','ending-film-top');top.append(el('span','','미해제 · 이야기의 끝 · '+(index+1)+' / 4'),button('장면 닫기',close));dialog.append(top);
  const copy=el('section','ending-film-copy'),heading=el('h2','',beats[index]);heading.id='endingSceneTitle';heading.tabIndex=-1;
  copy.append(el('p','ending-film-caption',captions[index]),heading,el('p','ending-film-story',last?story.choices[choice]:story.prose[index]));
  const dots=el('div','ending-film-dots');dots.setAttribute('aria-label','엔딩 장면 순서');
  beats.forEach((_,i)=>{const b=button('',()=>move(i));b.classList.toggle('active',i===index);b.disabled=i>furthest;b.setAttribute('aria-label',(i+1)+'번째 엔딩 장면'+(b.disabled?' · 다음 장면을 통해 열기':''));if(i===index)b.setAttribute('aria-current','step');dots.append(b)});copy.append(dots);
  const actions=el('div','ending-film-actions');
  if(index)actions.append(button('← 앞 장면',()=>move(index-1),'film-secondary'));
  if(!last)actions.append(button('다음 장면 →',()=>move(index+1),'film-primary'));
  else{
   const explanation=el('details','ending-film-explanation');explanation.append(el('summary','','사건 기록 펼치기 · 풀이와 근거'));
   story.reasons.forEach(([title,text,source])=>{const card=el('section','ending-film-reason');card.append(el('h3','',title),el('p','',text),el('p','ending-film-evidence','근거 · '+source));explanation.append(card)});
   explanation.append(el('p','ending-film-chosen',beats[3]));copy.append(explanation);
   const hook=el('div','ending-film-hook');hook.id='endingSceneHook';hook.tabIndex=-1;hook.hidden=!config.state.sceneEnding?.hookSeen;hook.append(el('p','',t.hook));
   const reveal=button('남겨진 흔적 살펴보기',()=>{hook.hidden=false;reveal.hidden=true;config.state.sceneEnding={...(config.state.sceneEnding||{}),hookSeen:true};config.save?.();hook.focus({preventScroll:true})});
   reveal.setAttribute('aria-controls',hook.id);reveal.hidden=!hook.hidden;copy.append(reveal,hook);
   recommendation(copy);if(config.detail)actions.append(button('발견한 이야기 다시 읽기',()=>{close();config.detail()},'film-secondary'));
   const home=el('a','film-primary','테마 로비로 →');home.href='index.html#cases';actions.append(home);
  }
  copy.append(actions);dialog.append(copy);
 }

 const nextCases={"garage":["cat-invite","고양이의 초대장","다음에는 이웃들의 선물을 식탁에 놓아볼까요?"],"apartment":["studio","비가 그친 사진관","다음에는 암실에서 한 장의 사진을 직접 인화해볼까요?"],"radio":["station","세 번째 승강장","다음에는 열차의 시간과 요금을 따라 길을 찾아볼까요?"],"station":["pet-home","첫 번째 보호자","다음에는 작은 물건과 오래된 사진으로 한 가족의 시간을 펼쳐볼까요?"],"laundry":["letter","반송된 편지","다음에는 돌아온 봉투를 새 주소로 보내볼까요?"],"letter":["ohang","돌아오는 계절","다음에는 다섯 빛의 그릇을 놓고 나에게 남긴 편지를 펼쳐볼까요?"],"pet-home":["radio","끝나지 않은 방송","다음에는 편집 부스에서 끊긴 녹음을 이어볼까요?"],"cat-invite":["garage","마지막 정비소","다음에는 두 시계의 차이로 그날 밤의 빈틈을 찾아볼까요?"],"studio":["apartment","404호의 불빛","다음에는 건물 뒤편의 불빛을 도면과 나란히 살펴볼까요?"],"ohang":["laundry","자정의 무인 세탁소","다음에는 자정을 넘긴 영수증의 시각을 되돌려볼까요?"]};
 function recommendation(copy){const [id,title]=nextCases[config.id],card=el('nav','ending-next-case');card.setAttribute('aria-label','다음 이야기');const descriptions={garage:'7분 빠른 영상, 사라진 SD카드',apartment:'사진과 도면으로 찾는 불빛의 출처',radio:'끊긴 녹음과 다시 켜진 송출 장치',station:'친구의 사진에서 시작하는 열차 여행',laundry:'12분 빠른 영수증과 사라진 코트',letter:'돌아온 봉투를 날짜순으로 정리하는 서고','pet-home':'담요와 옛 사진에 남은 루미의 첫날','cat-invite':'선물을 놓고 리본 속 초대장을 여는 오후',studio:'필름을 이어 암실에서 완성하는 사진',ohang:'그릇을 잇고 방위를 맞추는 오행당'};card.append(el('span','ending-next-label','다른 이야기'));const link=el('a','ending-next-link',title+' →');link.href=id==='studio'||id==='ohang'?id+'.html':id==='garage'?'case.html':'episode.html?case='+id;card.append(link,el('p','ending-next-description',descriptions[id]));copy.append(card);const feedback=button('플레이 소감 남기기',()=>{close();window.MihaejeFeedback?.open()},'ending-feedback-link');copy.append(feedback)}
 function show(c){
  if(!D[c.id]||!stories[c.id])return;
  stopVideo();window.MihaejeOverlay?.close({notify:false});config=c;index=0;furthest=0;endingMode='summary';returnFocus=document.activeElement;
  if(!dialog){
   dialog=el('dialog','ending-film');dialog.setAttribute('aria-label','이야기의 엔딩 장면');dialog.setAttribute('aria-labelledby','endingSceneTitle');
   dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
   dialog.addEventListener('close',stopVideo);
   document.body.append(dialog);
  }
  dialog.dataset.case=c.id;render();if(!dialog.open)dialog.showModal();dialog.querySelector('h2').focus({preventScroll:true});
 }
 window.MihaejeEnding={show,close};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)activeVideo?.pause()});
 window.addEventListener('pagehide',stopVideo);
})();
