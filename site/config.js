window.PROJECT_CONFIG = {
  "title": "电影票务管理平台",
  "positioning": "围绕影片、影院、影厅、场次、订单和评论评分的电影票务演示系统。",
  "repo": "ot-xm-film-ticket",
  "demoUrl": "https://ot-xm-film-ticket.pages.dev",
  "githubUrl": "https://github.com/Nemo-netone/ot-xm-film-ticket",
  "schema": "ot_xm_film_ticket",
  "colors": {
    "primary": "#111827",
    "secondary": "#b91c1c",
    "accent": "#d97706"
  },
  "accounts": [
    {
      "role": "admin",
      "username": "admin",
      "password": "admin",
      "label": "平台管理员"
    },
    {
      "role": "user",
      "username": "user",
      "password": "123456",
      "label": "观影用户"
    },
    {
      "role": "staff",
      "username": "cinema01",
      "password": "123456",
      "label": "影院运营"
    }
  ],
  "modules": [
    {
      "key": "film",
      "name": "影片管理",
      "summary": "影片、类型、演员、上映状态和热度"
    },
    {
      "key": "cinema",
      "name": "影院管理",
      "summary": "影院、区域、影厅和放映能力"
    },
    {
      "key": "show",
      "name": "场次排片",
      "summary": "影片场次、价格、座位和时间"
    },
    {
      "key": "order",
      "name": "票务订单",
      "summary": "购票、支付、取票和退票状态"
    },
    {
      "key": "comment",
      "name": "评论评分",
      "summary": "观众评论、评分和收藏"
    },
    {
      "key": "notice",
      "name": "公告视频",
      "summary": "公告、宣传片和运营信息"
    }
  ]
};
