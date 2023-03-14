FROM ubuntu:20.04
RUN apt-get update
RUN apt-get --assume-yes install python3.9
RUN apt-get --assume-yes install unzip
RUN apt-get --assume-yes install wget
RUN apt update
RUN apt --assume-yes install software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt --assume-yes install python3-pip
COPY requirements_robot.txt /tmp/requirements_robot.txt
RUN pip3 install -r /tmp/requirements_robot.txt
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get --assume-yes install -y -f
RUN apt-get --assume-yes install curl
RUN curl -o rcc https://downloads.robocorp.com/rcc/releases/latest/linux64/rcc
RUN chmod a+x rcc
RUN mv rcc /usr/local/bin/
RUN apt --assume-yes install -y git
RUN git clone https://github.com/itrust-consulting/draw.git
WORKDIR "/draw"
RUN git checkout draw_v2.0.5
WORKDIR "/"
COPY run_tests.sh /
RUN chmod 777 run_tests.sh