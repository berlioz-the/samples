FROM python:2.7-jessie as builder
RUN mkdir /install
WORKDIR /install
COPY src/requirements.txt /requirements.txt
RUN pip install --install-option="--prefix=/install" -r /requirements.txt -U

FROM python:2.7-alpine
COPY --from=builder /install /usr/local
COPY src /src
WORKDIR /src
ENTRYPOINT ["python"]
CMD ["main.py"]