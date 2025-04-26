@echo off
start cmd /k "cd /d user_authentication_service && nodemon server"
start cmd /k "cd /d restaurant_management_service && nodemon server"
start cmd /k "cd /d order_management_service && nodemon server"
start cmd /k "cd /d payment_service && nodemon server"
start cmd /k "cd /d delivery_management_service && nodemon server"
start cmd /k "cd /d frontend && npm start"