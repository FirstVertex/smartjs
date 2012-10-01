var calledSave = false;
var mockSaveResult = true;
var mockValidationResult = true;

var serverStub =
    {
        saveMember: function (dto, callback) {
            calledSave = true;
            console.log('stub saveMember called');
            callback(mockSaveResult);
        }
    };

var schemaStub =
    {
        member: {
            create: function () {
                return schemaStub.member.testMember;
            },
            testMember: {
                memberName: 'test'
            },
            validate: function (dto, errorMessages) {
                expect(dto).toBe(schemaStub.member.testMember);
                if (!mockValidationResult) {
                    errorMessages.push("test error message");
                }
                return mockValidationResult;
            }
        }
    };

define("server/dataContext", [], serverStub);
define("data/schema", [], schemaStub);

define(
    [
        "model"
    ],
    function (Model) {

        describe(
            "The NewMember binds to the member signup form.",
            function () {
                it(
                    "Should have a blank memberName field",
                    function () {
                        expect(Model.memberName()).toBe('');
                    }
                );

                it(
                    "Should have a boolean checkingMemberName that's false",
                    function () {
                        expect(Model.checkingMemberName()).toBe(false);
                    }
                );

                it(
                    "Should have a boolean goodMemberName that's false",
                    function () {
                        expect(Model.goodMemberName()).toBe(false);
                    }
                );

                it(
                    "Should have an empty array of errorMessages",
                    function () {
                        expect(Model.errorMessages().length).toBe(0);
                    }
                );

                it(
                    "invalidMemberName state should correspond to errorMessages length",
                    function () {
                        Model.errorMessages.push('test error');
                        expect(Model.invalidMemberName()).toBe(true);
                        Model.errorMessages.removeAll();
                        expect(Model.invalidMemberName()).toBe(false);
                    }
                );
            }
        );

        describe(
            "Exercise the Save function",
            function () {
                it(
                    "Happy path",
                    function () {
                        calledSave = false;
                        Model.save();
                        expect(Model.invalidMemberName()).toBe(false);
                        expect(Model.goodMemberName()).toBe(true);
                        expect(calledSave).toBe(true);
                        calledSave = false;
                    }
                );

                it(
                    "Validation failure",
                    function () {
                        mockValidationResult = false;
                        calledSave = false;
                        Model.save();
                        console.log('Model.invalidMemberName()=' + Model.invalidMemberName());
                        expect(Model.invalidMemberName()).toBe(true);
                        console.log('Model.goodMemberName()=' + Model.goodMemberName());
                        expect(Model.goodMemberName()).toBe(false);
                        console.log('calledSave=' + calledSave);
                        expect(calledSave).toBe(false);
                        calledSave = false;
                        mockValidationResult = true;
                    }
                );

                it(
                    "Save failure",
                    function () {
                        mockSaveResult = false;
                        calledSave = false;
                        Model.save();
                        console.log('Model.invalidMemberName()=' + Model.invalidMemberName());
                        expect(Model.invalidMemberName()).toBe(true);
                        console.log('Model.goodMemberName()=' + Model.goodMemberName());
                        expect(Model.goodMemberName()).toBe(false);
                        console.log('calledSave=' + calledSave);
                        expect(calledSave).toBe(true);
                        expect(Model.errorMessages().length).toBe(1);
                        expect(Model.errorMessages()[0].indexOf('taken')).not.toBe(-1);
                        calledSave = false;
                        mockSaveResult = true;
                    }
                );

            }
        );
    }
);