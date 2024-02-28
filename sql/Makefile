# Makefile for managing PostgreSQL database operations

# Database configuration
DB_NAME=d5r8fucf69j020
DB_USER=fbxoxiesqtumdq
DB_HOST=ec2-3-228-117-228.compute-1.amazonaws.com


# SQL files
COMMENTS_SQL=comments.sql

.PHONY: all comments

all: comments

comments:
	@echo "Executing comments SQL commands..."
	psql -d $(DB_NAME) -U $(DB_USER) -h $(DB_HOST) -w -f $(COMMENTS_SQL)