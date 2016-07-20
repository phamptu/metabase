import { tryFetchData, tryUpdateData, tryUpdateFields } from 'metabase/reference/utils';

describe("Reference utils.js", () => {
    const getProps = ({
        section = {
            fetch: {test1: [], test2: [2], test3: [3,4]}
        },
        entity = { foo: 'foo', bar: 'bar' },
        entities = { foo: {foo: 'foo', bar: 'bar'}, bar: {foo: 'bar', bar: 'foo'} },
        test1 = jasmine.createSpy('test1'),
        test2 = jasmine.createSpy('test2'),
        test3 = jasmine.createSpy('test3'),
        updateField = jasmine.createSpy('updateField'),
        clearError = jasmine.createSpy('clearError'),
        resetForm = jasmine.createSpy('resetForm'),
        endEditing = jasmine.createSpy('endEditing'),
        startLoading = jasmine.createSpy('startLoading'),
        setError = jasmine.createSpy('setError'),
        endLoading = jasmine.createSpy('endLoading')
    } = {}) => ({
        section,
        entity,
        entities,
        test1,
        test2,
        test3,
        updateField,
        clearError,
        resetForm,
        endEditing,
        startLoading,
        setError,
        endLoading
    });

    describe("tryFetchData()", () => {
        it("should call all fetch functions in section with correct arguments", async (done) => {
            const props = getProps();
            await tryFetchData(props);

            expect(props.test1).toHaveBeenCalledWith();
            expect(props.test2).toHaveBeenCalledWith(2);
            expect(props.test3).toHaveBeenCalledWith(3, 4);
            expect(props.clearError.calls.count()).toEqual(1);
            expect(props.startLoading.calls.count()).toEqual(1);
            expect(props.setError.calls.count()).toEqual(0);
            expect(props.endLoading.calls.count()).toEqual(1);
            done();
        });

        xit("should set error when error occurs", async () => {
            const props = getProps(() => Promise.reject('test'));
            tryFetchData(props).catch(error => console.error(error))

            expect(props.test1).toHaveBeenCalledWith();
            expect(props.test2).toHaveBeenCalledWith(2);
            expect(props.test3).toHaveBeenCalledWith(3, 4);
            expect(props.clearError.calls.count()).toEqual(1);
            expect(props.startLoading.calls.count()).toEqual(1);
            expect(props.setError.calls.count()).toEqual(0);
            expect(props.endLoading.calls.count()).toEqual(1);
        });
    });

    describe("tryUpdateData()", () => {
        it("should call update function with merged entity", async (done) => {
            const props = getProps({
                section: {
                    update: 'test1'
                },
                entity: { foo: 'foo', bar: 'bar' }
            });
            const fields = {bar: 'bar2'};

            await tryUpdateData(fields, props);

            expect(props.test1.calls.argsFor(0)[0]).toEqual({foo: 'foo', bar: 'bar2'});
            expect(props.endEditing.calls.count()).toEqual(1);
            expect(props.resetForm.calls.count()).toEqual(1);
            expect(props.startLoading.calls.count()).toEqual(1);
            expect(props.setError.calls.count()).toEqual(0);
            expect(props.endLoading.calls.count()).toEqual(1);
            done();
        });

        it("should ignore untouched fields when merging changed fields", async (done) => {
            const props = getProps({
                section: {
                    update: 'test1'
                },
                entity: { foo: 'foo', bar: 'bar' }
            });
            const fields = {foo: '', bar: undefined, boo: 'boo'};

            await tryUpdateData(fields, props);

            expect(props.test1.calls.argsFor(0)[0]).toEqual({foo: '', bar: 'bar', boo: 'boo'});
            expect(props.endEditing.calls.count()).toEqual(1);
            expect(props.resetForm.calls.count()).toEqual(1);
            expect(props.startLoading.calls.count()).toEqual(1);
            expect(props.setError.calls.count()).toEqual(0);
            expect(props.endLoading.calls.count()).toEqual(1);
            done();
        });
    });

    describe("tryUpdateFields()", () => {
        it("should call update function with all updated fields", async (done) => {
            const props = getProps();
            const formFields = {
                foo: {foo: undefined, bar: 'bar2'},
                bar: {foo: '', bar: 'bar2'}
            };

            await tryUpdateFields(formFields, props);

            expect(props.updateField.calls.argsFor(0)[0]).toEqual({foo: 'foo', bar: 'bar2'});
            expect(props.updateField.calls.argsFor(1)[0]).toEqual({foo: '', bar: 'bar2'});
            done();
        });

        it("should not call update function for items where all fields are untouched", async (done) => {
            const props = getProps();
            const formFields = {
                foo: {foo: undefined, bar: undefined},
                bar: {foo: undefined, bar: ''}
            };

            await tryUpdateFields(formFields, props);

            expect(props.updateField.calls.argsFor(0)[0]).toEqual({foo: 'bar', bar: ''});
            expect(props.updateField.calls.count()).toEqual(1);
            done();
        });
    });
});
