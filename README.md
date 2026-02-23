# 翱翔安居 · 西安工业大学 校园租房平台（MVP 自营版）

实现内容与需求文档一致：
- 手机号注册/登录
- 学生证图片上传 + 后台人工审核（审核通过后才能看详情）
- 房源列表/详情
- 申请看房（后台统一处理联系）
- 后台：房源管理 / 用户管理 / 申请管理 / 数据统计 / 操作留痕
- 不做在线支付，不开放自由发布

## Supabase
1) Supabase 新建 Project
2) SQL Editor 执行：`supabase/schema.sql`
3) 可选：再执行 `supabase/seed.sql` 写入示例房源

## Netlify 环境变量（必须）
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET（随便填一个长随机字符串）
- ADMIN_PIN（建议设置；后台页会让你输入PIN）

## 部署
把整个项目 zip 上传 Netlify：Deploys -> browse to upload

入口：
- 首页：/#/
- 我的：/#/me
- 申请：/#/apply
- 后台：/#/admin
