# Résumés

Every file is one page. PDFs are in `pdf/`; editable Word versions are in `docx/`.

## Which one to send

| Applying to | Internship | Full-time |
|---|---|---|
| **Quant** (quant dev, research, trading) | `Quant_Internship` | `Quant_FullTime` |
| **Software engineering** | `SWE_Internship` | `SWE_FullTime` |
| **AI / machine learning** | `ML_Internship` | `ML_FullTime` |
| **Consulting** (management + tech) | `Consulting_Internship` | `Consulting_FullTime` |
| **Data science / analytics** | `Data_Internship` | `Data_FullTime` |
| **LinkedIn, career fairs, anything else** | `General` | `General` |

## What changes between versions

- **Quant:** math coursework, both published papers, C++ and Kelly/Monte Carlo work up top.
- **SWE:** systems work (gRPC, concurrency, Docker, WebSockets) and projects with their tech stacks.
- **AI/ML:** model results first (36.7% → 95.0% LLM accuracy, 99.5% mAP@50), plus LLM/RAG tools.
- **Consulting:** results in plain business language, leadership, and an Interests line.
- **Data:** SQL, Power BI, feature engineering, and measurable data wins.
- **Internship vs. full-time:** internship versions put Education and coursework first. Full-time tech
  versions put Experience first and go deeper on each job.

## Editing

- **Quick fix:** open the `.docx` in Word or Google Docs.
- **Change every version at once:** edit `src/content.py`, then run `python3 resumes/src/build.py`.
  The build shrinks or spaces each résumé so it always fits on one page.
