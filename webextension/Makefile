TARGET = ../dime-extension.xpi

SOURCES := $(shell find . -name '*.js' -or -name '*.json' -or -name '*.png')

all: $(TARGET)

$(TARGET): $(SOURCES)
	rm $(TARGET)
	zip $(TARGET) $(SOURCES)
