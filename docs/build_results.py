import json,sys
s=json.load(open(sys.argv[1]))
# 평가자 실명 → 코드 매핑은 저장소에 두지 않고 로컬 파일(sys.argv[3], JSON)로 받아요.
EV=json.load(open(sys.argv[3]))
g=lambda x,i: x[i].strip() if len(x)>i else ''
def merged(tab):
    r=s[tab]; out={}
    for row in r[1:]:
        e=EV.get(row[1].strip())
        if not e: continue
        d=out.setdefault(e,{})
        for i in range(2,len(r[0])):
            v=g(row,i)
            if v: d[i]=v
    return out
def ints(v):
    try: return int(v)
    except: return None
EVS=['E1','E2','E3','E4','E5','E6']
Q=[]  # likert/text questions
def add(step,tab,spec):
    m=merged(tab)
    for key,col,kind,label,whycol in spec:
        q={'key':key,'step':step,'kind':kind,'label':label,'q':s[tab][0][col].split('] ',1)[-1],'scores':{},'why':{}}
        for e in EVS:
            v=m.get(e,{}).get(col)
            if v:
                q['scores'][e]=ints(v) if kind=='scale' else v
            if whycol is not None:
                w=m.get(e,{}).get(whycol)
                if w and w not in('상동',): q['why'][e]=w
        Q.append(q)
add(1,'1 연구 개요',[('s1_q1',2,'scale','연구 절차 이해 용이성',3),('s1_free',4,'text','연구 절차 보완점',None)])
add(2,'2 수집전처리',[('s2_q1',2,'scale','수집 기준 적합성',3),('s2_q2',4,'scale','분석 대상 선정 타당성',5),('s2_q3',6,'scale','전처리 규칙 적절성',7)])
add(3,'3 토픽모델링',[('s3_q1',2,'scale','토픽–키워드–대표 리뷰 연결',3)])
add(4,'4 리뷰 기반 분석',[('s4_q1',2,'scale','AI 행동 유형 도출 방식 적절성',3),('s4_q2',4,'scale','행동 유형·변수의 설명력',5),('s4_q4',6,'scale','행동 특성의 리뷰 근거',7),('s4_reflect',8,'text','리뷰 AI 분석 보완점',None)])
add(5,'5 인터뷰 기반 분석',[('s5_q1',2,'scale','연구자 1차 분석 + AI 재구성 방식',3),('s5_q2',4,'scale','행동 유형·변수의 설명력',5),('s5_q3',6,'scale','행동 특성의 발화 근거',7),('s5_reflect',8,'text','인터뷰 AI 분석 보완점',None)])
add(7,'7 종합평가',[('s8_q1',2,'scale','연구 절차의 체계성',None),('s8_q2',3,'scale','토픽→분류→행동 특성 논리 연결',None),('s8_q3',4,'scale','데이터 특성별 분석 절차 구성',None),('s8_q4',5,'text','연구 절차 평가 이유',None),
 ('s8_q5',6,'scale','AI가 원문 근거로 도출하도록 구성',None),('s8_q6',7,'scale','연구자 원문 대조 검증의 적절성',None),('s8_q7',8,'text','AI 분석·검증 평가 이유',None),
 ('s8_diff',9,'choice','리뷰·인터뷰 퍼소나 차이 체감',None),('s8_diff_why',10,'text','차이를 느낀(못 느낀) 이유',None),
 ('s8_q10',11,'scale','인터뷰 퍼소나 보완 자료로서의 가치',None),('s8_q11',12,'scale','리뷰 퍼소나만으로는 대체 어려움(역문항)',None),('s8_q12',13,'scale','다른 제품·서비스 적용 가능성',None),('s8_q13',14,'text','활용 가능성 평가 이유',None),
 ('m_revise',17,'text','보완이 필요한 단계',None),('m_revise_detail',19,'text','보완 내용',None),('m_ai_approach',20,'text','본인이라면 AI를 쓸 단계',None),('m_final',21,'text','추가 의견',None)])
# E1 old-instrument extras
old={'s4_q1_why_old':None}
# profile
pm=merged('0 사전 질문'); ph=s['0 사전 질문'][0]
col=lambda name:[i for i,h in enumerate(ph) if h==name][0]
P={}
for e in EVS:
    d=pm.get(e,{})
    P[e]={'age':d.get(3,''),'major':d.get(4,''),'role':d.get(6,''),'industry':d.get(7,''),'career':d.get(8,''),
          'aiTools':d.get(9,''),'aiFreq':d.get(11,''),'aiReview':d.get(14,''),
          'uresMethod':d.get(16,''),'uresWhy':d.get(18,''),'pxMade':d.get(19,''),'pxAi':d.get(21,''),'pxDiff':d.get(28,'') if len(ph)>28 else ''}
# check header indices
idx={h:i for i,h in enumerate(ph)}
def pv(e,label): return pm.get(e,{}).get(idx[label],'')
for e in EVS:
    P[e]={k:pv(e,l) for k,l in [('age','연령대를 말씀해주실 수 있을까요?'),('major','UX·HCI·디자인 등 사용자 경험과 관련된 분야를 전공하셨나요?'),('role','현재 담당하고 계신 직무 또는 역할은 무엇인가요?'),('industry','현재 근무하고 계신 업종 또는 산업 분야는 무엇인가요?'),('career','현재 직무와 관련된 총 경력은 어느 정도인가요?'),('aiTools','평소 주로 사용하는 생성형 AI 서비스를 모두 골라 주세요. (복수 선택 가능)'),('aiFreq','업무에서 생성형 AI를 얼마나 자주 사용하시나요?'),('aiReview','생성형 AI가 만든 결과물을 업무에 활용할 때 어느 정도 검토하거나 수정해서 사용하시는 편인가요?')]}
    for k,l in [('uresWhy','위 방법을 선택하신 이유'),('pxMade','업무나 프로젝트에서 퍼소나를 다룬 경험'),('pxAi','생성형 AI를 활용해 퍼소나를 제작해본 경험'),('pxDiff','생성형 AI로 퍼소나를 만들 때 겪었던 어려움'),('uresMethod','업무나 프로젝트에서 실제 사용자 인터뷰를 진행하기 어려운 경우')]:
        cands=[h for h in ph if h.startswith(l) and '기타' not in h]
        P[e][k]=pv(e,cands[0]) if cands else ''
# E1 from old profile
o=s['(구) 0 기본 프로필'][1]
P['E1'].update({'major':'기타(석사 재학 중)','role':g(o,6),'industry':g(o,7),'career':g(o,8),'aiTools':g(o,9),'aiFreq':g(o,11),'aiReview':g(o,14),'pxMade':g(o,16),'pxAi':g(o,18),'pxDiff':g(o,24)})
# step6
r=s['6 최종 품질 평가']; S6={}
for x in r[1:]:
    e=EV.get(x[1].strip()); v=g(x,9)
    if e and v: S6.setdefault(e,{}).setdefault(g(x,2),{})[g(x,7)]=int(v)
# step6 notes
n=merged('6 최종 품질 평가(의견)'); nh=s['6 최종 품질 평가(의견)'][0]
N6={}
for e,d in n.items():
    for i,v in d.items():
        if i<3: continue
        hdr=nh[i]; persona=hdr.split('· ')[1].split(']')[0]; kind='strong' if '설득력' in hdr else 'weak'
        N6.setdefault(e,{}).setdefault(persona,{})[kind]=v
order={e:d.get(2,'') for e,d in n.items()}
# E1 old memos
M1=[]
for x in s['6 최종 품질 평가(이전 메모)'][1:]:
    if g(x,5) and not g(x,5).startswith('상동'): M1.append({'persona':g(x,2),'dim':g(x,3),'text':g(x,5)})
# judgements
def judge(tab,idcol):
    out=[]
    for x in s[tab][1:]:
        e=EV.get(x[1].strip())
        if e: out.append({'ev':e,'persona':g(x,2),'id':g(x,3),'score':ints(g(x,4)),'agree':g(x,5),'why':g(x,6)})
    return out
# 연구자 추가 입력: E1(파일럿·구버전)에는 없던 7단계 Q10·Q11
for q in Q:
    if q['key']=='s8_q10': q['scores']['E1']=2
    if q['key']=='s8_q11': q['scores']['E1']=4
res={'evaluators':EVS,'profile':P,'questions':Q,'step6':S6,'step6Notes':N6,'step6Order':order,'e1Memos':M1,
     'reviewJudge':judge('4-3 리뷰별 판정',3),'interviewJudge':judge('5-3 참여자별 판정',3)}
json.dump(res,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)
for q in Q:
    if q['kind']=='scale': print(q['step'],q['key'],q['scores'])
print({e:{p:len(v) for p,v in d.items()} for e,d in S6.items()})
print(json.dumps(P,ensure_ascii=False)[:1500])
